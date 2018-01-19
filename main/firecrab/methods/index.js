import _ from 'lodash'
import Promise from 'bluebird'
import moment from 'moment'

import { base, _getAllRecords, getMember } from '../../api/airtable'

// eslint-disable-next-line no-extend-native
String.prototype.splice = function (idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem))
}

export const saveDone = async (bySlackIDs, text, date) => {
  const bys = await Promise.all(_.map(bySlackIDs, slackID => getMember(slackID)))
  const create = Promise.promisify(base('Done').create)
  await Promise.all(_.map(_.map(bys, 'id'), by => create({
    'By': [by],
    'Text': text,
    'Date': date
  })))
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
    fields: ['Slack ID', 'Last contribution', 'Member Since'],
    filterByFormula: '{Status} != \'Veteran\''
  }))
  const allRecords = []
  records.forEach(({ id: airtableId, fields: { 'Slack ID': slackId, 'Last contribution': lastContribution, 'Member Since': memberSince } }) => allRecords.push({
    airtableId,
    slackId,
    lastContribution,
    memberSince
  }))
  for (let record of allRecords) {
    const { airtableId, slackId, lastContribution, memberSince } = record
    const dones = []
    listDone.forEach(done => (done['By'][0] === airtableId ? dones.push(done['Text']) : null))
    const helpsIds = []
    for (let help of listThanks) {
      if (help['To'][0] === airtableId) {
        const { fields } = await getMember(help['By'][0])
        helpsIds.push(fields['Slack ID'])
      }
    }
    if (dones.length >= 1 || helpsIds.length >= 1) {
      const helps = []
      helpsIds.forEach((slackId) => {
        let exist = false
        let index = 0
        helps.forEach(({ slackId: uniq }, i) => {
          if (uniq === slackId) {
            exist = true
            index = i
          }
        })
        if (exist === true) {
          helps[index].number += 1
        } else {
          helps.push({ slackId, number: 1 })
        }
      })
      activities.push({ slackId, dones, helps })
    } else {
      const difference = lastContribution > 0 ? Date.now() - lastContribution : Date.now() - moment(memberSince).valueOf()
      const number = Math.round(moment.duration(difference).asWeeks())
      inactives.push({ slackId, number })
    }
  }
  return { activities, inactives }
}

export const parseSlackMessage = (text) => {
  let name
  let embed = text.splice(0, 0, ' ')
  embed = embed.splice(embed.length, 0, ' ')
  do {
    name = /\s@[a-z._0-9]+\s/g.exec(String(embed))
    if (name) {
      embed = embed.splice(name.index + 1, 0, '<')
      embed = embed.splice(name.index + name[0].length, 0, '>')
    }
  } while (name)
  return embed.trim()
}
