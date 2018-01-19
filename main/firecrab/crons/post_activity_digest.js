import _ from 'lodash'
import cron from 'cron'
import Promise from 'bluebird'

import { log, bots, isProd } from '../config'
import { getLastWeekDone, getLastWeekThanks, getActivities } from '../methods/index'

const postActivityDigest = new cron.CronJob({
  cronTime: '00 00 18 * * 0',
  onTick: async function () {
    try {
      const sendMessage = Promise.promisify(bots[0].say)
      const listDone = await getLastWeekDone()
      const listThanks = await getLastWeekThanks()
      const { activities, inactives } = await getActivities(listDone, listThanks)
      const sortActivities = []
      const sortHelps = []
      activities.forEach(({ slackId, dones, helps }) => {
        let textDones = ''
        let textHelps = ''
        dones.forEach((done) => {
          textDones = textDones.concat(`- ${done}\n`)
        })
        helps.forEach(({ slackId, number }, index) => {
          if (index === 0) {
            textHelps = textHelps.concat(`<@${slackId}>${number > 1 ? ` (${number})` : ''}`)
          } else if (index + 1 === helps.length) {
            textHelps = textHelps.concat(` and <@${slackId}>${number > 1 ? ` (${number})` : ''}`)
          } else {
            textHelps = textHelps.concat(`, <@${slackId}>${number > 1 ? ` (${number})` : ''}`)
          }
        })
        if (helps.length > 0) sortHelps.push({ text: `<@${slackId}> helped ${textHelps}` })
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
      await sendMessage({
        text: `:fire: *Activity Digest* :fire:\nWhat has been done inside Mangrove last week:`,
        attachments: _.map(sortActivities, ({ text, title }) => ({ title, text, mrkdwn_in: ['text'] })),
        channel: isProd ? '#general' : '#ghost-playground'
      })

      // Catalyst Thanks KPI
      await sendMessage({
        text: `Hi <!subteam^S7WBYB6TZ>!\nThere is a total of *${listThanks.length} thanks* this week :heavy_heart_exclamation_mark_ornament:`,
        attachments: _.map(sortHelps, ({ text }) => ({ text, mrkdwn_in: ['text'] })),
        channel: isProd ? '#track-catalysts' : '#ghost-playground'
      })

      // Inactive member message
      if (inactives.length > 0) {
        let textInactives = ''
        inactives.forEach(({ slackId, number }, index) => {
          if (index === 0) {
            textInactives = textInactives.concat(`<@${slackId}>${number > 1 ? ` +${number - 1}` : ''}`)
          } else if (index + 1 === inactives.length) {
            textInactives = textInactives.concat(` and <@${slackId}>${number > 1 ? ` +${number - 1}` : ''}`)
          } else {
            textInactives = textInactives.concat(`, <@${slackId}>${number > 1 ? ` +${number - 1}` : ''}`)
          }
        })
        await sendMessage({
          text: `No activity recorded this week: ${textInactives}.`,
          channel: isProd ? '#track-catalysts' : '#ghost-playground'
        })
        await sendMessage({
          text: `No activity recorded this week: ${textInactives}.`,
          channel: isProd ? '#residents' : '#ghost-playground'
        })
      }
    } catch (e) {
      log('the `post_activity_digest` cron', e)
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

postActivityDigest.start()
