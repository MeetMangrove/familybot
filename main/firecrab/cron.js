import _ from 'lodash'
import cron from 'cron'

import { bots } from './config'
import { getLastWeekDone, getLastWeekThanks, getActivities } from '../methods'

const { CronJob } = cron

const sendActivityDigest = new CronJob({
  cronTime: '00 00 12 * * 1',
  onTick: function () {
    _.forEach(bots, async (bot) => {
      const listDone = await getLastWeekDone()
      const listThanks = await getLastWeekThanks()
      const { activities, inactives } = await getActivities(listDone, listThanks)
      let text = `:fire: *Activity Digest* :fire:\nWhat has been done inside Mangrove last week:`
      let textInactives = ""
      activities.forEach(({ member, dones, helps }) => {
        let textDones = ""
        let textHelps = ""
        dones.forEach((done) => {
          textDones = textDones.concat(`- ${done}\n`)
        })
        helps.forEach((help, index) => {
          if (index === 0) {
            textHelps = textHelps.concat(`<@${help}>`)
          } else if (index + 1 === helps.length) {
            textHelps = textHelps.concat(` and <@${help}>`)
          } else {
            textHelps = textHelps.concat(`, <@${help}>`)
          }
        })
        const template = `\n\n${dones.length > 0 ? `<@${member}>:\n\`\`\`${textDones}\`\`\`` : ''}\n${helps.length > 0 ? `<@${member}> ${dones.length > 0 ? 'also' : '' } helped ${textHelps}${dones.length > 0 ? '!' : ' :pray:' }` : ''}`
        text = text.concat(template)
      })
      inactives.forEach((inactive, index) => {
        if (index === 0) {
          textInactives = textInactives.concat(`<@${inactive}>`)
        } else if (index + 1 === inactives.length) {
          textInactives = textInactives.concat(` and <@${inactive}>`)
        } else {
          textInactives = textInactives.concat(`, <@${inactive}>`)
        }
      })
      if (inactives.length > 0) text = text.concat(`\n\nNo activity recorded this week: ${textInactives} :surfer:`)
      bot.say({
        text,
        channel: '#done'
      })
    })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

sendActivityDigest.start()