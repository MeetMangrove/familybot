import _ from 'lodash'
import moment from 'moment'
import Promise from 'bluebird'

import { base, _getAllRecords, getMember } from '../../api/airtable'

export const sort = (a, b) => {
  if (a.text < b.text) return -1
  if (a.text > b.text) return 1
  return 0
}

export const saveProfile = async (slackId, { 'Skills': skill, ...newProfile }) => {
  const oldProfile = await getMember(slackId)
  const update = Promise.promisify(base('Moods').update)
  let record = null
  let learning = null
  let lastLearning = null
  let skills = oldProfile.fields['Skills']
  if (skill) {
    const records = await _getAllRecords(base('Skills').select({
      view: 'Grid view',
      fields: ['Name'],
      filterByFormula: `{Value}='${skill}'`
    }))
    record = records[0]
    if (skills && skills.length > 0) {
      skills.push(record.id)
    } else {
      skills = [record.id]
    }
    learning = _.clone(oldProfile.get('Learning'))
    _.pull(learning, record.id)
    lastLearning = oldProfile.get('Last learning')
    _.pull(lastLearning, record.id)
  }
  await update(oldProfile.id, {
    ...newProfile,
    'Is new location?': !_.isEqual(oldProfile.get('Location'), newProfile['Location']),
    'Is new focus?': !_.isEqual(oldProfile.get('Focus'), newProfile['Focus']),
    'Is new challenges?': !_.isEqual(oldProfile.get('Challenges'), newProfile['Challenges']) && newProfile['Challenges'] !== '',
    'Skills': skills,
    'Last skill': record && record.id ? [record.id] : oldProfile.get('Last skill'),
    'Is new skill?': !!skill === true ? true : oldProfile.get('Is new skill?'),
    'Learning': learning || oldProfile.get('Learning'),
    'Last learning': lastLearning || oldProfile.get('Last learning')
  })
  return {
    isUpdated: !_.isEqual(oldProfile.get('Location'), newProfile['Location']) ||
    !_.isEqual(oldProfile.get('Focus'), newProfile['Focus']) ||
    !_.isEqual(oldProfile.get('Challenges'), newProfile['Challenges']) ||
    !!skill,
    learningRemoved: learning && !_.isEqual(oldProfile.get('Learning'), learning),
    newSkill: record ? record.get('Name') : null
  }
}

export const getUpdates = async () => {
  const members = []
  const updates = []
  const records = await _getAllRecords(base('Members').select({
    view: 'Familybot View',
    fields: ['Name', 'Email', 'Slack ID', 'Location', 'Is new location?', 'Focus', 'Is new focus?', 'Challenges', 'Is new challenges?', 'Is new skill?', 'Last skill', 'Is new learning?', 'Last learning'],
    filterByFormula: 'OR({Is new location?}=1, {Is new focus?}=1, {Is new challenges?}=1, {Is new skill?}=1, {Is new learning?}=1)'
  }))
  records.forEach(record => members.push({ id: record.id, ...record.fields }))
  for (let member of members) {
    const find = Promise.promisify(base('Skills').find)
    if (member['Last skill']) {
      const lastSkill = await find(member['Last skill'][0])
      member['Last skill'] = lastSkill ? [lastSkill.get('Name')] : null
    }
    if (member['Last learning']) {
      const lastLearning = await find(member['Last learning'][0])
      member['Last learning'] = lastLearning ? [lastLearning.get('Name')] : null
    }
    updates.push({
      id: member.id,
      slackId: member['Slack ID'],
      fullName: member['Name'],
      email: member['Email'],
      location: member['Is new location?'] === true ? member['Location'] : null,
      focus: member['Is new focus?'] === true ? member['Focus'] : null,
      challenges: member['Is new challenges?'] === true && member['Challenges'] ? member['Challenges'] : null,
      skill: member['Is new skill?'] === true ? member['Last skill'] : null,
      learning: member['Is new learning?'] === true ? member['Last learning'] : null
    })
  }
  return updates
}

export const getLearningPeople = async (skill) => {
  const list = []
  const records = await _getAllRecords(base('Skills').select({
    view: 'Grid view',
    fields: ['Name', 'Learning of'],
    filterByFormula: `{Name}='${skill}'`
  }))
  if (records.length === 0) return list
  const ids = records[0].get('Learning of')
  if (!ids) return list
  for (let id of ids) {
    const profile = await getMember(id)
    list.push(profile.get('Slack ID'))
  }
  return list
}

export const getTeachingPeople = async (learning) => {
  const list = []
  const records = await _getAllRecords(base('Skills').select({
    view: 'Grid view',
    fields: ['Name', 'Skill of'],
    filterByFormula: `{Name}='${learning}'`
  }))
  if (records.length === 0) return list
  const ids = records[0].get('Skill of')
  if (!ids) return list
  for (let id of ids) {
    const profile = await getMember(id)
    list.push(profile.get('Slack ID'))
  }
  return list
}

export const cleanUpdates = (members) => members.forEach(({ id }) => base('Members').update(id, {
  'Is new location?': false,
  'Is new focus?': false,
  'Is new challenges?': false,
  'Is new skill?': false,
  'Is new learning?': false
}))

export const createNewsletter = async (members) => {
  const create = Promise.promisify(base('Newsletters').create)
  let text = 'Hi there!\n' +
    'Here is a small digest of some Mangrove members update!\n\n' +
    '⬇️------------------------------⬇️'
  members.forEach((member) => {
    const { fullName, email, location, focus, challenges, skill, learning } = member
    text = text.concat(`\n\n${fullName} (${email})`)
    if (location) text = text.concat(`\n🏡 just moved to ${location}`)
    if (focus) text = text.concat(`\n🚀 has a new focus: \n${focus}`)
    if (challenges) text = text.concat(`\n🌪 is currently dealing with the following challenge(s): \n${challenges}`)
    if (skill) text = text.concat(`\n💪 has developed a new skill: ${skill}, congratulation 🎉`)
    if (learning) text = text.concat(`\n👶 starting to learn ${learning}`)
  })
  text = text.concat('\n\nGo Mangrove 👊\nTake care ❤️\n\nYour dear Fresh Manatee')
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
  const learning = _.clone(profile.get('Learning'))
  _.pull(learning, record.id)
  const lastLearning = profile.get('Last learning')
  _.pull(lastLearning, record.id)
  await update(profile.id, {
    'Skills': skills,
    'Last skill': [record.id],
    'Is new skill?': true,
    'Learning': learning,
    'Last learning': lastLearning
  })
  return { skill: displaySkill, learningRemoved: !_.isEqual(profile.get('Learning'), learning) }
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
