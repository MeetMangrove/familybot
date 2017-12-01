import _ from 'lodash'
import cron from 'cron'

import { bots } from './config'
import { getLastWeekDone, getLastWeekThanks, getActivities } from './methods'

const { CronJob } = cron

const sendActivityDigest = new CronJob({
  cronTime: '00 00 18 * * 0',
  onTick: async function () {
    for (let bot of bots) {
      try {
        const listDone = await getLastWeekDone()
        const listThanks = await getLastWeekThanks()
        const { activities, inactives } = await getActivities(listDone, listThanks)
        const sortActivities = []
        activities.forEach(({ slackId, dones, helps }) => {
          let textDones = ''
          let textHelps = ''
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
          const template = ` ${dones.length > 0 ? `\`\`\`${textDones}\`\`\`` : ''} ${helps.length > 0 ? `${dones.length > 0 ? 'also ' : ''}helped ${textHelps}${dones.length > 0 ? '!' : ' :pray:'}` : ''}`
          sortActivities.push({
            text: template,
            title: `<@${slackId}>`,
            nbActivities: dones.length + helps.length
          })
        })
        sortActivities.sort((a, b) => {
          if (a.nbActivities > b.nbActivities) return -1
          if (a.nbActivities < b.nbActivities) return 1
          return 0
        })

        // General Message
        bot.say({
          text: `:fire: *Activity Digest* :fire:\nWhat has been done inside Mangrove last week:`,
          attachments: _.map(sortActivities, ({ text, title }) => ({ title, text, mrkdwn_in: ['text'] })),
          channel: '#general'
        })

        // Catalyst Thanks KPI
        bot.say({
          text: `Hi <!subteam^S7WBYB6TZ>!\nThere is a total of *${listThanks.length} thanks* this week :heavy_heart_exclamation_mark_ornament:`,
          channel: '#track-catalysts'
        }, (err) => {
          if (err) throw new Error(err)
          if (inactives.length > 0) {
            let textInactives = ''
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
              text: `No activity recorded this week: ${textInactives}.`,
              channel: '#track-catalysts'
            })
            bot.say({
              text: `No activity recorded this week: ${textInactives}.`,
              channel: '#residents'
            })
          }
        })
      } catch (e) {
        console.log(e)
        bot.say({
          text: `Ho nooo... :persevere: A little error occur in my cron \`sendActivityDigest\`: \`${e.message || e.error || e}\``,
          channel: '#mangrove-tech'
        })
      }
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

sendActivityDigest.start()
