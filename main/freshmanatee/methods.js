import _ from 'lodash'
import Promise from 'bluebird'
import moment from 'moment'

import { base, _getAllRecords, getMember } from '../airtable'

export const saveProfile = async (slackId, newProfile) => {
  const oldProfile = await getMember(slackId)
  const update = Promise.promisify(base('Moods').update)
  await update(oldProfile.id, {
    ...newProfile,
    'Is new location?': !_.isEqual(oldProfile.get('Location'), newProfile['Location']),
    'Is new focus?': !_.isEqual(oldProfile.get('Focus'), newProfile['Focus']),
    'Is new challenges?': !_.isEqual(oldProfile.get('Challenges'), newProfile['Challenges']) /*,
    'Is new skills?': !_.isEqual(oldProfile.get('Skills'), newProfile['Skills']),
    'Is new interests?': !_.isEqual(oldProfile.get('Interests'), newProfile['Interests']) */
  })
  return !_.isEqual(oldProfile.get('Location'), newProfile['Location']) ||
    !_.isEqual(oldProfile.get('Focus'), newProfile['Focus']) ||
    !_.isEqual(oldProfile.get('Challenges'), newProfile['Challenges']) /* ||
    !_.isEqual(oldProfile.get('Interests'), newProfile['Interests']) ||
    !_.isEqual(oldProfile.get('Skills'), newProfile['Skills']) */
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
