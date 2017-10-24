import _ from 'lodash'
import cron from 'cron'

import { bots } from './config'
import { getLastWeekDone, getLastWeekThanks } from '../methods'

const { CronJob } = cron

const sendActivityDigest = new CronJob({
  cronTime: '30 * * * * *',
  onTick: function () {
    _.forEach(bots, async (bot) => {
      const listDone = await getLastWeekDone()
      const listThanks = await getLastWeekThanks()
      console.log(listDone)
      console.log(listThanks)
      const activities = []
      let text = `:fire: *Activity Digest* :fire:
        What has been done inside Mangrove last week:`
      activities.forEach(({ member, dones, helps }) => {
        let textDones = ""
        let textHelps = ""
        dones.forEach((done) => {
          textDones.concat(`- ${done}\n`)
        })
        helps.forEach((help, index) => {
          if (index === 0) {
            textHelps.concat(`<@${help}>`)
          } else if (index + 1 === helps.length) {
            textHelps.concat(` and <@${help}>`)
          } else {
            textHelps.concat(`, <@${help}>`)
          }
        })
        const template = `\n\n
        ${dones.length > 0 ? `<@${member}>:
        \`\`\`${textDones}\`\`\`` : null}
        ${helps.length > 0 ? `<@${member}> ${dones.length > 0 ? 'also' : null } helped ${textHelps}${dones.length > 0 ? '!' : ' :pray:' }` : null}`
        text = text.concat(template)
      })

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