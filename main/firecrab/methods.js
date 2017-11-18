import _ from 'lodash'
import Promise from 'bluebird'

import { base, _getAllRecords, getMember } from '../airtable'

// eslint-disable-next-line no-extend-native
String.prototype.splice = function (idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem))
}

export const saveDone = async (bySlackID, text, date) => {
  const { id: by } = await getMember(bySlackID)
  const create = Promise.promisify(base('Done').create)
  await create({
    'By': [by],
    'Text': text,
    'Date': date
  })
}

export const saveThanks = async (bySlackID, toSlackIDs, text, date) => {
  const { id: by } = await getMember(bySlackID)
  const tos = await Promise.all(_.map(toSlackIDs, slackID => getMember(slackID)))
  const create = Promise.promisify(base('Thanks').create)
  await Promise.all(_.map(_.map(tos, 'id'), to => create({
    'By': [by],
    'To': [to],
    'Text': text,
    'Date': date
  })))
}

export const getLastWeekDone = async () => {
  const ping = Date.now() - 604800000
  const records = await _getAllRecords(base('Done').select({
    view: 'Per teammate',
    filterByFormula: `{Date} >= ${ping}`
  }))
  return _.map(records, 'fields')
}

export const getLastWeekThanks = async () => {
  const ping = Date.now() - 604800000
  const records = await _getAllRecords(base('Thanks').select({
    view: 'Received',
    filterByFormula: `{Date} >= ${ping}`
  }))
  return _.map(records, 'fields')
}

export const getActivities = async (listDone, listThanks) => {
  const activities = []
  const inactives = []
  const records = await _getAllRecords(base('Members').select({
    view: 'Familybot View',
    fields: ['Slack ID']
  }))
  const allRecords = []
  records.forEach(({ id: airtableId, fields: { 'Slack ID': slackId } }) => allRecords.push({ airtableId, slackId }))
  for (let record of allRecords) {
    const { airtableId, slackId } = record
    const dones = []
    listDone.forEach(done => (done['By'][0] === airtableId ? dones.push(done['Text']) : null))
    const helps = []
    for (let help of listThanks) {
      if (help['To'][0] === airtableId) {
        const { fields } = await getMember(help['By'][0])
        helps.push(fields['Slack Username'].substring(fields['Slack Username'].indexOf('@') + 1))
      }
    }
    if (dones.length >= 1 || helps.length >= 1) {
      activities.push({ slackId, dones, helps: _.uniq(helps) })
    } else {
      inactives.push(slackId)
    }
  }
  return { activities, inactives }
}

export const parseSlackMessage = (text) => {
  const regEx = /\s?@[a-z._]+/g
  let name
  let embed = text
  do {
    name = regEx.exec(embed)
    if (name && !name[0].match(/\|@[a-z._]+/g)) {
      if (name[0].match(/\s@[a-z._]+/g)) {
        embed = embed.splice(name.index + 1, 0, '<')
      } else {
        embed = embed.splice(name.index, 0, '<')
      }
      embed = embed.splice(name.index + name[0].length + 1, 0, '>')
    }
  } while (name && !name[0].match(/\|@[a-z._]+/g))
  return embed
}
