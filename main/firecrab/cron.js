import _ from 'lodash'
import cron from 'cron'

import { bots } from './config'
import { getLastWeekDone, getLastWeekThanks, getActivities } from '../methods'

const { CronJob } = cron

const sendActivityDigest = new CronJob({
  cronTime: '10,20,30,40,50 * * * * 4',
  onTick: function () {
    _.forEach(bots, async (bot) => {
      const listDone = await getLastWeekDone()
      const listThanks = await getLastWeekThanks()
      const { activities, inactives } = await getActivities(listDone, listThanks)
      const sortActivities = []
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
        const template = ` ${dones.length > 0 ? `\`\`\`${textDones}\`\`\`` : ''} ${helps.length > 0 ? `${dones.length > 0 ? 'and also helped' : `helped` } ${textHelps}${dones.length > 0 ? '!' : ' :pray:' }` : ''}`
        sortActivities.push({
          text: template,
          title: `<@${member}>`,
          nbActivities: dones.length + helps.length
        })
      })
      sortActivities.sort((a, b) => {
        if (a.nbActivities > b.nbActivities) return -1;
        if (a.nbActivities < b.nbActivities) return 1;
        return 0;
      })
      bot.say({
        text: `:fire: *Activity Digest* :fire:\nWhat has been done inside Mangrove last week:`,
        attachments: _.map(sortActivities, ({ text, title }) => ({ title, text, mrkdwn_in: ["text"] })),
        channel: '#dev-test'
      }, (err) => {
        if (err) return console.log(err)
        if (inactives.length > 0) {
          let textInactives = ""
          inactives.forEach((inactive, index) => {
            if (index === 0) {
              textInactives = textInactives.concat(`<@${inactive}>`)
            } else if (index + 1 === inactives.length) {
              textInactives = textInactives.concat(` and <@${inactive}>`)
            } else {
              textInactives = textInactives.concat(`, <@${inactive}>`)
            }
          })
          bot.say({
            text: `No activity recorded this week: ${textInactives} :surfer:`,
            channel: '#dev-test'
          })
        }
      })
    })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

sendActivityDigest.start()