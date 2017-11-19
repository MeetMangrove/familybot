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
      _.forEach(members, ({ id }) => {
        try {
          bot.startPrivateConversation({ user: id }, (err, convo) => {
            if (err) return console.log(err)
            giveMood({ bot, convo, id })
          })
        } catch (e) {
          console.log(e)
          bot.say({
            text: `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``,
            channel: id
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
          text: `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``,
          channel: '#moods'
        })
      }
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

askMood.start()
sendMood.start()
