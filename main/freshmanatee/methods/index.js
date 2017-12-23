import _ from 'lodash'
import moment from 'moment'
import Promise from 'bluebird'

import { base, _getAllRecords, getMember } from '../../airtable'

export const sort = (a, b) => {
  if (a.text < b.text) return -1
  if (a.text > b.text) return 1
  return 0
}

export const saveProfile = async (slackId, { 'Skills': skill, ...newProfile }) => {
  const records = await _getAllRecords(base('Skills').select({
    view: 'Grid view',
    fields: ['Value'],
    filterByFormula: `{Value}='${skill}'`
  }))
  const oldProfile = await getMember(slackId)
  const update = Promise.promisify(base('Moods').update)
  if (skill) oldProfile.fields['Skills'].push(records[0].id)
  await update(oldProfile.id, {
    ...newProfile,
    'Is new location?': !_.isEqual(oldProfile.get('Location'), newProfile['Location']),
    'Is new focus?': !_.isEqual(oldProfile.get('Focus'), newProfile['Focus']),
    'Is new challenges?': !_.isEqual(oldProfile.get('Challenges'), newProfile['Challenges']) && newProfile['Challenges'],
    'Skills': oldProfile.fields['Skills'],
    'Is new skill?': !!skill
  })
  return !_.isEqual(oldProfile.get('Location'), newProfile['Location']) ||
    !_.isEqual(oldProfile.get('Focus'), newProfile['Focus']) ||
    !_.isEqual(oldProfile.get('Challenges'), newProfile['Challenges']) ||
    !!skill
}

export const getUpdates = async () => {
  const members = []
  const records = await _getAllRecords(base('Members').select({
    view: 'Familybot View',
    fields: ['Name', 'Email', 'Slack ID', 'Location', 'Is new location?', 'Focus', 'Is new focus?', 'Challenges', 'Is new challenges?'],
    filterByFormula: 'OR({Is new location?}=1, {Is new focus?}=1, {Is new challenges?}=1)'
  }))
  records.forEach((member) => {
    members.push({
      id: member.id,
      slackId: member.get('Slack ID'),
      fullName: member.get('Name'),
      email: member.get('Email'),
      location: member.get('Is new location?') === true ? member.get('Location') : null,
      focus: member.get('Is new focus?') === true ? member.get('Focus') : null,
      challenges: member.get('Is new challenges?') === true ? member.get('Challenges') : null
    })
  })
  return members
}

export const cleanUpdates = (members) => members.forEach(({ id }) => base('Members').update(id, {
  'Is new location?': false,
  'Is new focus?': false,
  'Is new challenges?': false
}))

export const createNewsletter = async (members) => {
  let text = 'Hi there!\n' +
    'Here is a small digest of some Mangrove members update! I\'m sure you can help out one of them! You may make a difference!\n\n' +
    '⬇️------------------------------⬇️\n'
  members.forEach((member) => {
    const { fullName, email, location, focus, challenges } = member
    text = text.concat(`\n${fullName} (${email})\n${location ? `🏡 just moved to *${location}*\n` : ''}${focus ? `🚀 has a new focus:\n${focus}\n` : ''}${challenges ? `🌪 is currently dealing with the following challenge(s): \n${challenges}\n` : ''}`)
  })
  text = text.concat('\n\nGo Mangrove 👊\nTake care ❤️\n\nYour Fresh Manatee')
  const create = Promise.promisify(base('Newsletters').create)
  const { id } = await create({
    'Content': text,
    'Title': 'Some news from Fresh Manatee!',
    'Sending Date': moment().isoWeekday(4).format('DD/MM/YYYY')
  })
  return { id, text }
}

export const getEmails = async (status) => {
  const records = await _getAllRecords(base('Members').select({
    view: 'Familybot View',
    fields: ['Email'],
    filterByFormula: `FIND('${status}', {Status})`
  }))
  return _.map(records, record => record.get('Email'))
}

export const getNewsletter = async (date) => {
  const newsletter = await _getAllRecords(base('Newsletters').select({
    view: 'Grid view',
    filterByFormula: `{Sending Date}='${date}'`
  }))
  return newsletter[0]
}

export const getSkillsList = async (slackId) => {
  const profile = await getMember(slackId)
  const records = await _getAllRecords(base('Skills').select({
    view: 'Grid view',
    fields: ['Name', 'Value', 'Skill of']
  }))
  return _.compact(_.map(records, (record) => {
    let users = _.compact(_.flatten([record.get('Skill of')]))
    return users.indexOf(profile.id) !== -1 ? null : { text: record.get('Name'), value: record.get('Value') }
  }))
}

export const getLearningList = async (slackId) => {
  const profile = await getMember(slackId)
  const records = await _getAllRecords(base('Skills').select({
    view: 'Grid view',
    fields: ['Name', 'Value', 'Skill of', 'Learning of']
  }))
  return _.compact(_.map(records, (record) => {
    let users = _.compact(_.flatten([record.get('Skill of'), record.get('Learning of')]))
    return users.indexOf(profile.id) !== -1 ? null : { text: record.get('Name'), value: record.get('Value') }
  }))
}

export const getMemberWithSkills = async (slackId) => {
  const profile = await getMember(slackId)
  const find = Promise.promisify(base('Skills').find)
  const skills = _.compact(_.flatten([profile.get('Skills')]))
  const learning = _.compact(_.flatten([profile.get('Learning')]))
  const skillList = []
  for (let skill of skills) {
    const record = await find(skill)
    skillList.push({ text: record.get('Name'), value: record.get('Value') })
  }
  profile.fields['Skills'] = skillList
  const learningList = []
  for (let learn of learning) {
    const record = await find(learn)
    learningList.push({ text: record.get('Name'), value: record.get('Value') })
  }
  profile.fields['Learning'] = learningList
  return profile
}

export const setNewSkill = async (slackId, skill) => {
  const records = await _getAllRecords(base('Skills').select({
    view: 'Grid view',
    fields: ['Name', 'Value'],
    filterByFormula: `{Value}='${skill}'`
  }))
  let record
  let displaySkill
  if (records.length === 0) {
    const create = Promise.promisify(base('Skills').create)
    let value = skill.toLowerCase()
    value = value.replace(/ /g, '_')
    record = await create({ 'Name': skill, 'Value': value })
    displaySkill = { text: skill, value }
  } else {
    record = records[0]
    displaySkill = { text: record.get('Name'), value: record.get('Value') }
  }
  const profile = await getMember(slackId)
  const update = Promise.promisify(base('Members').update)
  let skills = profile.get('Skills')
  if (skills && skills.length > 0) {
    skills.push(record.id)
  } else {
    skills = [record.id]
  }
  await update(profile.id, {
    'Skills': skills,
    'Last skill': [record.id],
    'Is new skill?': true
  })
  return displaySkill
}

export const removeSkill = async (slackId, skill) => {
  const records = await _getAllRecords(base('Skills').select({
    view: 'Grid view',
    fields: ['Name', 'Value', 'Skill of', 'Last skill of'],
    filterByFormula: `{Value}='${skill}'`
  }))
  const record = records[0]
  const update = Promise.promisify(base('Members').update)
  const profile = await getMember(slackId)
  const skillOf = record.get('Skill of')
  _.pull(skillOf, profile.id)
  const lastSkillOf = record.get('Last skill of')
  _.pull(lastSkillOf, profile.id)
  await update(record.id, {
    'Skill of': skillOf,
    'Last skill of': lastSkillOf
  })
  return { text: record.get('Name'), value: record.get('Value') }
}

export const setNewLearning = async (slackId, learning) => {
  const records = await _getAllRecords(base('Skills').select({
    view: 'Grid view',
    fields: ['Name', 'Value'],
    filterByFormula: `{Value}='${learning}'`
  }))
  let record
  let displayLearning
  if (records.length === 0) {
    const create = Promise.promisify(base('Skills').create)
    let value = learning.toLowerCase()
    value = value.replace(/ /g, '_')
    record = await create({ 'Name': learning, 'Value': value })
    displayLearning = { text: learning, value }
  } else {
    record = records[0]
    displayLearning = { text: record.get('Name'), value: record.get('Value') }
  }
  const profile = await getMember(slackId)
  const update = Promise.promisify(base('Members').update)
  let learns = profile.get('Learning')
  if (learns && learns.length > 0) {
    learns.push(record.id)
  } else {
    learns = [record.id]
  }
  await update(profile.id, {
    'Learning': learns,
    'Last learning': [record.id],
    'Is new learning?': true
  })
  return displayLearning
}

export const removeLearning = async (slackId, learning) => {
  const records = await _getAllRecords(base('Skills').select({
    view: 'Grid view',
    fields: ['Name', 'Value', 'Learning of', 'Last learning of'],
    filterByFormula: `{Value}='${learning}'`
  }))
  const record = records[0]
  const update = Promise.promisify(base('Members').update)
  const profile = await getMember(slackId)
  const learningOf = record.get('Learning of')
  _.pull(learningOf, profile.id)
  const lastLearningOf = record.get('Last learning of')
  _.pull(lastLearningOf, profile.id)
  await update(record.id, {
    'Learning of': learningOf,
    'Last learning of': lastLearningOf
  })
  return { text: record.get('Name'), value: record.get('Value') }
}
