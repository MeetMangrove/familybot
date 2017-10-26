/**
 * Created by thomasjeanneau on 10/06/2017.
 */

import _ from 'lodash'
import cron from 'cron'
import moment from 'moment'

import { bots } from './config'
import askForUpdate from './askForUpdate'
import { getAllMembers, getUpdates, cleanUpdates } from '../methods'

const { CronJob } = cron

const sendMessage = new CronJob({
  cronTime: '00 00 09 * * 1',
  onTick: function () {
    _.forEach(bots, async (bot) => {
      const members = await getAllMembers(bot)
      const weekNb = moment().format('ww')
      const chunk = _.chunk(members, members.length / 2)
      let list
      if (weekNb % 2 === 1) {
        list = chunk[0]
      } else {
        list = chunk[1]
      }
      _.forEach(list, (params) => {
        bot.startPrivateConversation({ user: params.id }, function (err, convo) {
          if (err) return console.log(err)
          convo.addMessage(`Hi ${params.name}!`, 'default')
          convo.addMessage(`I'd like to know if you have some fresh news for me :blush:`, 'default')
          askForUpdate({ bot, convo, ...params })
        })
      })
    })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

const postDigest = new CronJob({
  cronTime: '00 00 19 * * 3',
  onTick: function () {
    _.forEach(bots, async (bot) => {
      const members = await getUpdates()
      const attachments = []
      members.forEach((member) => {
        const { name, location, focus, challenges } = member
        attachments.push({
          title: `<${name}>`,
          text: `${location ? `:house_with_garden: just moved to *${location}*\n` : ''}${focus ? `:rocket: has a new focus: \`\`\`${focus}\`\`\`\n` : ''}${challenges ? `:tornado: is currently dealing with the following challenge(s): \`\`\`${challenges}\`\`\`` : ''}`,
          mrkdwn_in: ["text"]
        })
      })
      bot.say({
        text: `:heart:️ *Members updates* :heart:️\nThis is what changed in the lives of fellow Mangrovers:`,
        attachments,
        channel: '#general'
      }, async (err) => {
        if (err) return console.log(err)
        bot.say({
          text: `Go Mangrove :facepunch:`,
          channel: '#general'
        })
        cleanUpdates(members)
      })
    })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

sendMessage.start()
postDigest.start()
