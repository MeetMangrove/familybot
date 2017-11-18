/**
 * Created by thomasjeanneau on 10/06/2017.
 */

import _ from 'lodash'
import cron from 'cron'
import moment from 'moment'

import { bots } from './config'
import mailgun from '../mailgun'
import askForUpdate from './askForUpdate'
import { getUpdates, cleanUpdates, createNewsletter, getEmails, getNewsletter } from './methods'
import Slack from '../slack'

const { CronJob } = cron

const sendMessage = new CronJob({
  cronTime: '00 00 09 * * 1',
  onTick: async function () {
    for (let bot of bots) {
      try {
        const members = await Slack.all(bot)
        const weekNb = moment().format('ww')
        const chunk = _.chunk(members, members.length / 2)
        let list
        if (weekNb % 2 === 1) {
          list = chunk[0]
        } else {
          list = chunk[1]
        }
        _.forEach(list, ({ id: slackId }) => {
          bot.startPrivateConversation({ user: slackId }, function (err, convo) {
            if (err) return console.log(err)
            convo.addMessage(`Hi <@${slackId}>!`, 'default')
            convo.addMessage(`I'd like to know if you have some fresh news for me :blush:`, 'default')
            askForUpdate({ bot, convo, slackId })
          })
        })
      } catch (e) {
        console.log(e)
        bot.say({
          text: `Oops..! :sweat_smile: A little error occur during your cron: \`${e.message || e.error || e}\``,
          channel: '#mangrove-tech'
        })
      }
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

const postDigest = new CronJob({
  cronTime: '00 00 18 * * 3',
  onTick: async function () {
    for (let bot of bots) {
      try {
        const members = await getUpdates()
        const attachments = []
        members.forEach((member) => {
          const { slackId, location, focus, challenges } = member
          attachments.push({
            title: `<@${slackId}>`,
            text: `${location ? `:house_with_garden: just moved to *${location}*\n` : ''}${focus ? `:rocket: has a new focus: \`\`\`${focus}\`\`\`\n` : ''}${challenges ? `:tornado: is currently dealing with the following challenge(s): \`\`\`${challenges}\`\`\`` : ''}`,
            mrkdwn_in: ['text']
          })
        })

        // General Message
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
        })

        // Catalyst Challenges
        bot.say({
          text: `Hi <!subteam^S7WBYB6TZ>!\nHere is the currents Mangrovers' challenges :tornado:`,
          channel: '#track-catalysts'
        }, (err) => {
          if (err) return console.log(err)
          members.forEach((member) => {
            const { slackId, challenges } = member
            if (challenges !== null) {
              bot.say({
                text: `<@${slackId}> is currently dealing with the following challenge(s): \`\`\`${challenges}\`\`\``,
                channel: '#track-catalysts'
              })
            }
          })
        })

        // Connector Newsletter
        const { text, id } = await createNewsletter(members)
        bot.say({
          text: `Hi <!subteam^S7W60V3L6>!\nHere is the content of the Veteran Newsletter to be sent :love_letter:`,
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
            'It will be automatically sent tomorrow at 2PM!\n' +
            ':information_source: Good update includes :\n' +
            '- Correcting typos\n' +
            '- Removing private stuff\n' +
            '- Adding infos about next event',
            channel: '#track-connectors'
          })
        })
      } catch (e) {
        console.log(e)
        bot.say({
          text: `Oops..! :sweat_smile: A little error occur during your cron: \`${e.message || e.error || e}\``,
          channel: '#mangrove-tech'
        })
      }
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

const sendNewsletter = new CronJob({
  cronTime: '00 00 14 * * 4',
  onTick: async function () {
    const emails = await getEmails('Veteran')
    const newsletter = await getNewsletter()
    const data = {
      from: 'Fresh Manatee <hellomangrove@gmail.com>',
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
