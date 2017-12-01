/**
 * Created by thomasjeanneau on 16/07/2017.
 */

import _ from 'lodash'
import cron from 'cron'

import { bots } from './config'
import Slack from '../slack'
import giveMood from './giveMood'
import getMood from './getMood'

const { CronJob } = cron

const askMood = new CronJob({
  cronTime: '00 00 15 * * 1-5',
  onTick: async function () {
    for (let bot of bots) {
      const members = await Slack.all(bot)
      _.forEach(members, ({ id: slackId }) => {
        try {
          bot.startPrivateConversation({ user: slackId }, (err, convo) => {
            if (err) throw new Error(err)
            giveMood({ bot, convo, slackId })
          })
        } catch (e) {
          console.log(e)
          bot.say({
            text: `What? :scream: My cron \`askMood\` is broken: \`${e.message || e.error || e}\``,
            channel: '#mangrove-tech'
          })
        }
      })
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

const sendMood = new CronJob({
  cronTime: '00 00 19 * * *',
  onTick: async function () {
    for (let bot of bots) {
      try {
        await getMood({ bot, channel: '#moods' })
      } catch (e) {
        console.log(e)
        bot.say({
          text: `What? :scream: My cron \`sendMood\` is broken: \`${e.message || e.error || e}\``,
          channel: '#mangrove-tech'
        })
      }
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

askMood.start()
sendMood.start()
