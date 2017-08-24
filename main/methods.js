/**
 * Created by thomasjeanneau on 20/03/2017.
 */

import _ from 'lodash'
import Promise from 'bluebird'
import asyncForEach from 'async-foreach'

import { base, _getAllRecords } from './airtable'
import firstTimeConversation from './learningbot/firstTimeConversation'
const {forEach} = asyncForEach

const {
  AIRTABLE_MEMBERS,
  AIRTABLE_MOOD,
  AIRTABLE_APPLICANTS,
  AIRTABLE_PAIRING
} = process.env

if (!AIRTABLE_MEMBERS && !AIRTABLE_APPLICANTS && !AIRTABLE_PAIRING) {
  console.log('Error: Specify AIRTABLE_MEMBERS, AIRTABLE_APPLICANTS and AIRTABLE_PAIRING in a .env file')
  process.exit(1)
}

// get slack user info by id
export const getSlackUser = async (bot, id) => {
  const apiUser = Promise.promisifyAll(bot.api.users)
  const {user} = await apiUser.infoAsync({user: id})
  return user
}

// get member by id
export const getMember = async (id) => {
  const findMember = Promise.promisify(base(AIRTABLE_MEMBERS).find)
  const member = await findMember(id)
  return member
}

// check if the id is one of a bot
export const checkIfBot = async (bot, id) => {
  if (id === 'USLACKBOT') return true
  const apiUsers = Promise.promisifyAll(bot.api.users)
  const {user: {is_bot: isBot}} = await apiUsers.infoAsync({token: bot.config.bot.app_token, user: id})
  return isBot
}

// get all slack members
export const getAllMembers = async (bot) => {
  const apiUser = Promise.promisifyAll(bot.api.users)
  const {members} = await apiUser.listAsync({token: bot.config.bot.app_token})
  _.remove(members, ({ id }) => checkIfBot(bot, id) === true)
  return members
}

export const getIdFromName = async (name) => {
  const records = await _getAllRecords(base(AIRTABLE_MEMBERS).select({
    view: 'Main View',
    filterByFormula: `{Slack Handle} = '@${name}'`
  }))
  return records[0].id
}

export const saveMood = async (id, level, comment) => {
  const create = Promise.promisify(base(AIRTABLE_MOOD).create)
  await create({
    'Member': [id],
    'Level': parseInt(level, 10),
    'Comment': /^\s*no+\s*$/i.test(comment) ? '' : comment,
    'Date': Date.now()
  })
}

export const getMoods = async () => {
  const ping = Date.now() - 86400000
  const records = await _getAllRecords(base(AIRTABLE_MOOD).select({
    view: 'Recent, by member',
    filterByFormula: `{Date} >= ${ping}`
  }))
  const list = _.map(records, r => r.fields)
  const moods = []
  for (let i = 0; i < list.length; i += 1) {
    let exist = false
    for (let j = 0; j < moods.length; j += 1) {
      if (list[i]['Member'][0] === moods[j]['Member'][0]) {
        exist = true
        if (list[i]['Date'] >= moods[j]['Date']) {
          moods[j] = list[i]
        }
      }
    }
    if (!exist) moods.push(list[i])
  }
  return moods
}

export const getEmoji = (level) => {
  switch (level) {
    case 1:
    case 2:
    case 3: {
      return ':sos:'
    }
    case 4:
    case 5:
    case 6: {
      return ':warning:'
    }
    case 7: {
      return ':slightly_smiling_face:'
    }
    case 8: {
      return ':simple_smile:'
    }
    case 9: {
      return ':smile:'
    }
    case 10: {
      return ':sunglasses:'
    }
    default: {
      return ':simple_smile: '
    }
  }
}

export const getColor = (level) => {
  switch (level) {
    case 1: return '#B71C1C'
    case 2: return '#D32F2F'
    case 3: return '#F44336'
    case 4: return '#F57F17'
    case 5: return '#FBC02D'
    case 6: return '#FFEB3B'
    case 7: return '#CDDC39'
    case 8: return '#9CCC65'
    case 9: return '#7CB342'
    case 10: return '#558B2F'
    default: return '#9CCC65'
  }
}

// get applicant with slack handle
export const getApplicant = async (slackHandle) => {
  const applicant = await _getAllRecords(base(AIRTABLE_APPLICANTS).select({
    maxRecords: 1,
    filterByFormula: `{Slack Handle}='@${slackHandle}'`
  }))
  return applicant[0]
}

// update applicant with slack handle
export const updateApplicant = async (slackHandle, obj) => {
  const update = Promise.promisify(base(AIRTABLE_APPLICANTS).update)
  const {id} = await getApplicant(slackHandle)
  const applicant = update(id, obj)
  return applicant
}

/* reads all applicants from Airtable, and returns them as an Array of
 {name: String,
 interests: [String],
 skills: [String]}
 */
export const getAllApplicants = async () => {
  const records = await _getAllRecords(base(AIRTABLE_APPLICANTS).select({
    view: 'Main View',
    fields: ['Slack Handle', 'Interests', 'Skills', 'Admin', 'Applicant'],
    filterByFormula: '{Inactive}=0'
  }))
  return _.reduce(records, (people, r) => {
    const name = (r.get('Slack Handle') || [])[0]
    if (name && name.length) {
      people.push({
        name: name.replace(/^@/, ''),
        interests: (r.get('Interests') || []),
        skills: (r.get('Skills') || []),
        isAdmin: !!r.get('Admin'),
        applicant: (r.get('Applicant') || [])[0]
      })
    }
    return people
  }, [])
}

/* reads all members from Slack, and returns them as an Array of
 {name: String,
 id: String}
 */
export const getAllNoApplicants = async (bot) => {
  const apiUser = Promise.promisifyAll(bot.api.users)
  const {members} = await apiUser.listAsync({token: bot.config.bot.app_token})
  const applicants = await getAllApplicants()
  const listMember = _.map(members, ({id, name}) => ({id, name}))
  const listApplicants = _.map(applicants, ({name}) => name)
  _.remove(listMember, ({name}) => listApplicants.indexOf(name) >= 0)
  return listMember
}

export const checkIfFirstTime = async (bot, message) => {
  const {name} = await getSlackUser(bot, message.user)
  const applicant = await getApplicant(name)
  if (!!applicant === false) {
    await firstTimeConversation(bot, message, {name})
  }
  return !!applicant
}

// reads all admins applicants from Airtable, and returns
// a boolean checking if the current user is an admin or not.
export const checkIfAdmin = async (bot, message) => {
  const admins = []
  const apiUser = Promise.promisifyAll(bot.api.users)
  const records = await _getAllRecords(base(AIRTABLE_APPLICANTS).select({
    view: 'Main View',
    filterByFormula: '{Admin}=1'
  }))
  records.forEach((record) => {
    const name = record.get('Slack Handle')[0]
    admins.push(name.replace(/^@/, ''))
  })
  const {user: {name}} = await apiUser.infoAsync({user: message.user})
  return admins.indexOf(name) >= 0
}

/* reads all pairing from Airtable, and returns them as an Array of
 {name: String,
 isLearner: Boolean,
 teacherName: String,
 learning: String,
 isTeacher: Boolean,
 learnerName: String,
 teaching: String}
 */
export const getMembersPaired = async () => {
  const applicants = await getAllApplicants()
  const members = _.map(applicants, ({name}) => ({name, isLearner: false, isTeacher: false}))
  const pairings = await getPairingsNotIntroduced()
  pairings.forEach((record) => {
    const learner = record.get('Learner')
    const teacher = record.get('Teacher')
    const skills = record.get('Skill')
    const index = _.random(skills.length - 1)
    const skill = skills[index]
    const indexLearner = _.findIndex(members, e => e.name === learner)
    const indexTeacher = _.findIndex(members, e => e.name === teacher)
    members[indexLearner].isLearner = true
    members[indexLearner].teacherName = teacher
    members[indexLearner].learning = skill
    members[indexTeacher].isTeacher = true
    members[indexTeacher].learnerName = learner
    members[indexTeacher].teaching = skill
  })
  return members
}

export const getPairingsNotIntroduced = async () => {
  const pairings = await _getAllRecords(base(AIRTABLE_PAIRING).select({
    view: 'Main View',
    filterByFormula: '{Introduced}=0'
  }))
  return pairings
}

// reads a Pairing from Airtable
export const getPairing = async (tableName, pairingId) => {
  const pairingRecords = await _getAllRecords(base(tableName).select({
    view: 'Main View',
    fields: ['Teacher', 'Learner', 'Skill', 'Paired On'],
    filterByFormula: `{Pairing Id}='${pairingId}'`
  }))
  let createdAt = pairingRecords.length && pairingRecords[0].get('Paired On')
  return {
    id: pairingId,
    createdAt: createdAt && createdAt + 'T00:00:00Z',
    pairs: _.map(pairingRecords, (r) => {
      return {
        teacherName: r.get('Teacher'),
        learnerName: r.get('Learner'),
        skills: r.get('Skill')
      }
    })
  }
}

// saves a Pairing to Airtable
export const savePairing = async (tableName, pairing) => {
  // ensure we have the proper structure
  if (!pairing.id) return console.log('missing pairing.id')
  if (!_.isArray(pairing.pairs)) return console.log('invalid pairing.pairs')
  // write the pairs to Airtable
  const create = Promise.promisify(base(tableName).create)
  await Promise.map(pairing.pairs, (pair) => {
    return create({
      'Pairing Id': pairing.id,
      'Paired On': pairing.createdAt.substr(0, 10),
      'Teacher': pair.teacherName,
      'Learner': pair.learnerName,
      'Skill': pair.skills
    })
  })
  return pairing
}

// removes a Pairing from Airtable
export const destroyPairing = async (tableName, pairingId) => {
  const pairingRecords = await _getAllRecords(base(tableName).select({
    view: 'Main View',
    fields: [],
    filterByFormula: `{Pairing Id}='${pairingId}'`
  }))
  const destroy = Promise.promisify(base(tableName).destroy)
  await Promise.map(pairingRecords, (record) => {
    return destroy(record.getId())
  })
  return pairingId
}

// update a airtable member
export const updateMember = async (id, object) => {
  const update = Promise.promisify(base(AIRTABLE_MEMBERS).update)
  const record = await update(id, object)
  return record
}

// get available members for weeklynews
export const getAvailableMembers = async () => {
  const records = await _getAllRecords(base(AIRTABLE_MEMBERS).select({
    view: 'Main View',
    fields: ['Slack Handle', 'Asked for news this month [weeklynews]']
  }))
  const members = _.map(records, (record) => ({
    airtableId: record.id,
    name: record.get('Slack Handle') ? record.get('Slack Handle').replace(/^@/, '') : '',
    asked: record.get('Asked for news this month [weeklynews]')
  }))
  const numberMembers = Math.floor(members.length / 4)
  const membersAvailable = _.filter(members, {asked: undefined})
  return {members, numberMembers, membersAvailable}
}

// get 25% random available members
export const getRandomMembers = (bot, message) => new Promise(async (resolve, reject) => {
  try {
    const getResult = async (params) => {
      let {numberMembers, membersAvailable} = params
      const list = []
      for (let i = 0; i < numberMembers; i = i + 1) {
        const member = membersAvailable[Math.floor(Math.random() * membersAvailable.length)]
        _.remove(membersAvailable, ({name}) => { return name === member.name })
        if (member && member.name !== '') list.push(member)
      }
      const allSlackUser = await getAllMembers(bot)
      return _.map(list, ({name, airtableId}) => {
        const {id, profile: {first_name: firstName}} = _.find(allSlackUser, {name})
        return {airtableId, id, name, firstName}
      })
    }
    let res = await getAvailableMembers()
    if (res.membersAvailable.length < res.numberMembers) {
      bot.reply(message, `A lot of people has already been contacted, I'm cleaning the database...`)
      forEach(res.members, async function (member) {
        const done = this.async()
        await updateMember(member.airtableId, {
          'Asked for news this month [weeklynews]': false,
          'Message Timestamp [weeklynews]': null,
          'Asked by [weeklynews]': null
        })
        done()
      }, async () => {
        res = await getAvailableMembers()
        resolve(await getResult(res))
      })
    } else {
      resolve(await getResult(res))
    }
  } catch (e) {
    reject(e)
  }
})

// reads all members from Airtable, and returns
// a boolean checking if the current user is responsible of the Weekly News.
export const checkIfResponsible = async (bot, message) => {
  const slackUser = await getSlackUser(bot, message.user)
  const records = await _getAllRecords(base(AIRTABLE_MEMBERS).select({
    view: 'Main View',
    fields: ['Slack Handle'],
    filterByFormula: `AND(
      FIND('Cofounder', {Status}),
      {Is responsible ? [weeklynews]} = 1
    )`
  }))
  const responsible = records[0].get('Slack Handle').replace(/^@/, '')
  return {
    isResponsible: responsible === slackUser.name,
    responsible
  }
}

// get the current and the next responsible
export const getResponsibles = async (bot) => {
  const members = []
  const records = await _getAllRecords(base(AIRTABLE_MEMBERS).select({
    view: 'Main View',
    fields: ['Name', 'Slack Handle', 'Is responsible ? [weeklynews]'],
    filterByFormula: 'FIND(\'Cofounder\', {Status})'
  }))
  records.forEach((record) => {
    const name = record.get('Name')
    members.push({
      airtableId: record.id,
      slackName: record.get('Slack Handle').replace(/^@/, ''),
      lastName: name.substring(name.indexOf(' '), name.length),
      isResponsible: record.get('Is responsible ? [weeklynews]')
    })
  })
  members.sort(function (a, b) {
    if (a.lastName < b.lastName) return -1
    if (a.lastName > b.lastName) return 1
    return 0
  })
  const index = _.findIndex(members, {isResponsible: true})
  const {slackName: responsibleName, airtableId} = members[index]
  const nextIndex = index + 1 === members.length ? 0 : index + 1
  const {slackName: nextResponsibleName, airtableId: nextAirtableId} = members[nextIndex]
  const allMembers = await getAllMembers(bot)
  const {id: responsibleId} = _.find(allMembers, {name: responsibleName})
  const {id: nextResponsibleId} = _.find(allMembers, {name: nextResponsibleName})
  return {responsibleId, nextResponsibleId, airtableId, nextAirtableId}
}

// get the last weekly news message's timestamp of a user
export const getTimestamp = async (bot, userId, allMembers) => {
  const {name} = _.find(allMembers, {id: userId})
  const records = await _getAllRecords(base(AIRTABLE_MEMBERS).select({
    view: 'Main View',
    fields: ['Message Timestamp [weeklynews]'],
    filterByFormula: `{Slack Handle} = '@${name}'`
  }))
  return records[0].get('Message Timestamp [weeklynews]')
}

// get users already asked this month
export const getUsersAskedByResponsible = async (bot, userId) => {
  const users = []
  const records = await _getAllRecords(base(AIRTABLE_MEMBERS).select({
    view: 'Main View',
    fields: ['Slack Handle'],
    filterByFormula: `AND(
      {Asked for news this month [weeklynews]} = 1,
      {Asked by [weeklynews]} = '${userId}'
    )`
  }))
  const allMembers = await getAllMembers(bot)
  records.forEach((record) => {
    const name = record.get('Slack Handle').replace(/^@/, '')
    console.log(name)
    if(name && name !== '') {
      const member = _.find(allMembers, {name})
      if(member && member.id) {
        console.log(member.id)
        users.push(member.id)
      }
    }
  })
  return users
}
