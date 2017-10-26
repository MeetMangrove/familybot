/**
 * Created by thomasjeanneau on 16/07/2017.
 */

import _ from 'lodash'
import cron from 'cron'
import moment from 'moment-timezone'
import asyncForEach from 'async-foreach'

import { bots } from './config'
import {
  getAllMembers,
  getMoods,
  getMember,
  getEmoji,
  getColor
} from '../methods'
import giveMood from './giveMood'

const { CronJob } = cron
const { forEach } = asyncForEach

const askMood = new CronJob({
  cronTime: '00 00 15 * * *',
  onTick: function () {
    _.forEach(bots, async (bot) => {
      const members = await getAllMembers(bot)
      _.forEach(members, ({ name, id }) => {
        try {
          bot.startPrivateConversation({ user: id }, (err, convo) => {
            if (err) return console.log(err)
            giveMood(convo, name)
            convo.transitionTo('give_mood', `Hello ${name}! :smile:`);
          })
        } catch (e) {
          console.log(e)
          bot.reply({ user: id }, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
        }
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
      try {
        const moods = await getMoods()
        const attachments = []
        forEach(moods, async function (mood) {
          const done = this.async()
          const { fields: user } = await getMember(mood['Member'][0])
          attachments.push({
            'title': `<${user['Slack Handle']}> is at ${mood['Level']}/10 ${getEmoji(mood['Level'])}`,
            'text': mood['Comment'],
            'color': getColor(mood['Level']),
            'thumb_url': user['Profile Picture'][0].url,
            'footer': moment(mood['Date']).tz('Europe/Paris').format('MMM Do [at] h:mm A')
          })
          done()
        }, () => bot.say({
          'text': 'Hi dream team! Here is your mood daily digest :sparkles:',
          'channel': '#moods',
          'attachments': attachments
        }, (err, res) => {
          console.log(err)
          console.log(res)
        }))
      } catch (e) {
        console.log(e)
        bot.say({
          text: `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``,
          channel: '#moods'
        })
      }
    })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

askMood.start()
sendMood.start()
