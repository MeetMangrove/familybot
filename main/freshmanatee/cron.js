/**
 * Created by thomasjeanneau on 10/06/2017.
 */

import _ from 'lodash'
import cron from 'cron'
import moment from 'moment'

import { bots } from './config'
import askForUpdate from './askForUpdate'
import { getAllMembers, getUpdates, cleanUpdates, createNewsletter, getEmails, getNewsletter } from '../methods'

const { CronJob } = cron
const { MAILGUN_API_KEY } = process.env

if (!MAILGUN_API_KEY) {
  console.log('Error: Specify MAILGUN_API_KEY in a .env file')
  process.exit(1)
}

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
          mrkdwn_in: ['text']
        })
      })
      bot.say({
        text: `:heart:️ *Members updates* :heart:️\nThis is what changed in the lives of fellow Mangrovers:`,
        attachments,
        channel: '#general'
      }, async (err) => {
        if (err) return console.log(err)
        cleanUpdates(members)
        bot.say({
          text: `Go Mangrove :facepunch:`,
          channel: '#general'
        })
        const { text, id } = await createNewsletter(members)
        bot.say({
          text: `Hi <!subteam^S7W60V3L6|connectors>!\nHere is the content of the Veteran Newsletter to be sent tomorrow :love_letter:`,
          attachments: [{
            title: 'Draft Veteran Newsletter',
            text: `\`\`\`${text}\`\`\``,
            mrkdwn_in: ['text']
          }],
          channel: '#track-connectors'
        }, (err) => {
          if (err) return console.log(err)
          bot.say({
            text: `If you want to change it, <https://airtable.com/tblBsCEc45GtppbBP/viwIUnStSvSIhxqhv/${id}|click here to update the content field>.\n` +
            'You have 24 hours before, it\'s automatically sent !\n' +
            ':information_source: Good update includes :\n' +
            '- Correcting typos\n' +
            '- Removing private stuff\n' +
            '- Adding infos about next event',
            channel: '#track-connectors'
          })
        })
      })
    })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

const sendNewsletter = new CronJob({
  cronTime: '00 00 14 * * 4',
  onTick: async function () {
    const emails = await getEmails('Veteran')
    const newsletter = await getNewsletter()
    const mailgun = require('mailgun-js')({ apiKey: MAILGUN_API_KEY, domain: 'family.mangrove.io' })
    const data = {
      from: 'Fresh Manatee <hello@meetmangrove.com>',
      to: emails,
      subject: newsletter.get('Title'),
      text: newsletter.get('Content')
    }
    mailgun.messages().send(data, function (err, body) {
      if (err) console.log(err)
      console.log(body)
    })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

sendMessage.start()
postDigest.start()
sendNewsletter.start()
