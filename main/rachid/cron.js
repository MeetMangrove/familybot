/**
 * Created by thomasjeanneau on 16/07/2017.
 */

import _ from 'lodash'
import cron from 'cron'

import { bots } from './config'
import {
  getAllMembers
} from '../methods'
import giveMood from './giveMood'
import getMood from './getMood'

const { CronJob } = cron

const askMood = new CronJob({
  cronTime: '00 00 15 * * 1-5',
  onTick: function () {
    _.forEach(bots, async (bot) => {
      const members = await getAllMembers(bot)
      _.forEach(members, ({ name, id }) => {
        bot.startPrivateConversation({ user: id }, (err, convo) => {
          if (err) return console.log(err)
          giveMood({ bot, convo, name, id })
        })
      })
    })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

const sendMood = new CronJob({
  cronTime: '00 00 19 * * *',
  onTick: function () {
    _.forEach(bots, async (bot) => {
      await getMood(bot, '#moods')
    })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

askMood.start()
sendMood.start()
