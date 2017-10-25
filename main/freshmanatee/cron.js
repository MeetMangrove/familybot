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
  cronTime: '00 28 18 * * 3',
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
      let text = `*Members updates* :heart:️\nThis is what changed in the lives of fellow Mangrovers:`
      members.forEach((member) => {
        const { name, location, focus, challenges } = member
        text = text.concat(`\n\n${location ? `<${name}> just moved to ${location}\n` : ''}${focus ? `<${name}> has a new focus: \`\`\`${focus}\`\`\`\n` : ''}${challenges ? `<${name}> is currently dealing with the following challenge(s): \`\`\`${challenges}\`\`\`\n` : ''}`)
      })
      text = text.concat(`\n\nGo Mangrove :facepunch:`)
      bot.say({
        text,
        channel: '#general'
      }, async (err) => {
        if (err) return console.log(err)
        await cleanUpdates(members)
      })
    })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

sendMessage.start()
postDigest.start()
