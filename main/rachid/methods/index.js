import _ from 'lodash'
import Promise from 'bluebird'

import { base, _getAllRecords, getMember } from '../../api/airtable'

export const saveMood = async (slackId, level) => {
  const { id } = await getMember(slackId)
  const create = Promise.promisify(base('Moods').create)
  const mood = await create({
    'Member': [id],
    'Level': parseInt(level, 10),
    'Date': Date.now()
  })
  return mood.id
}

export const saveMoodDescription = async (id, comment) => {
  const update = Promise.promisify(base('Moods').update)
  await update(id, { 'Comment': comment })
}

export const getMoods = async () => {
  const ping = Date.now() - 86400000
  const records = await _getAllRecords(base('Moods').select({
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
    case 1: {
      return ':skull:'
    }
    case 2: {
      return ':cold_sweat:'
    }
    case 3: {
      return ':neutral_face:'
    }
    case 4: {
      return ':smile:'
    }
    case 5: {
      return ':tada:'
    }
    default: {
      return ':neutral_face: '
    }
  }
}

export const getColor = (level) => {
  switch (level) {
    case 1:
      return '#B71C1C'
    case 2:
      return '#F44336'
    case 3:
      return '#FBC02D'
    case 4:
      return '#7CB342'
    case 5:
      return '#558B2F'
    default:
      return '#FBC02D'
  }
}

export const getTitle = (level) => {
  switch (level) {
    case 1:
    case 2:
      return 'Do you feel like sharing what makes you feel this way?'
    case 3:
      return 'Do you want to share with us what\'s going on?'
    case 4:
    case 5:
      return 'Do you want to describe your feelings?'
    default:
      return 'Do you want to describe your feelings?'
  }
}


