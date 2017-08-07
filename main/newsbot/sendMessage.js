/**
 * Created by thomasjeanneau on 30/05/2017.
 */

import Promise from 'bluebird'
import Handlebars from 'handlebars'
import asyncForEach from 'async-foreach'

import { getRandomMembers, updateMember, checkIfBot } from '../methods'

require('dotenv').config()

const {forEach} = asyncForEach
const {NODE_ENV} = process.env

export default (bot, message, name, token) => new Promise((resolve, reject) => {
  try {
    let template
    bot.startPrivateConversation(message, (err, convo) => {
      if (err) return console.log(err)
      convo.addMessage({
        text: `Okay ${name}, let's build the weekly news!`
      }, 'default')

      convo.addQuestion({
        text: 'What\'s the message you want to send to everyone for asking some news ? You can use the variable _{firstName}_ if you want.'
      }, (response, convo) => {
        convo.gotoThread('completed')
      }, {key: 'response'}, 'default')

      convo.beforeThread('completed', (convo, next) => {
        const response = convo.extractResponse('response').replace(/{firstName}/, '{{firstName}}')
        template = Handlebars.compile(response, {noEscape: true})
        convo.setVar('message', template({firstName: 'Elon'}))
        next()
      })

      convo.addMessage({
        text: 'Awesome, this is your message if it\'s sent to Elon Musk:',
        attachments: [{
          title: 'Message:',
          text: '{{{vars.message}}}',
          mrkdwn_in: ['text']
        }]
      }, 'completed')

      convo.addQuestion({
        text: 'I\'m gonna send this message to 25% of the slack for you.',
        attachments: [
          {
            title: 'Is it okay?',
            callback_id: '123',
            attachment_type: 'default',
            actions: [
              {
                'name': 'yes',
                'text': 'Yes',
                'value': 'yes',
                'type': 'button'
              },
              {
                'name': 'no',
                'text': 'No',
                'value': 'no',
                'type': 'button'
              },
              {
                'name': 'later',
                'text': 'Later',
                'value': 'later',
                'type': 'button'
              }
            ]
          }
        ]
      }, [
        {
          pattern: 'yes',
          callback: async function (reply, convo) {
            try {
              const apiChat = Promise.promisifyAll(bot.api.chat)
              const members = await getRandomMembers(bot, message)
              bot.reply(message, `All right, I'm sending your message to ${members.length} people...`)
              forEach(members, async function ({airtableId, id, name, firstName}) {
                const done = this.async()
                let ts
                const isBot = await checkIfBot(bot, id)
                if (isBot === false && ((NODE_ENV === 'PRODUCTION' && id !== message.user) || id === message.user)) {
                  const message = await apiChat.postMessageAsync({
                    token,
                    channel: id,
                    text: template({firstName}),
                    as_user: true
                  })
                  ts = parseInt(message.ts, 10)
                } else {
                  console.log('Send to', name)
                  ts = Date.now()
                }
                await updateMember(airtableId, {
                  'Asked for news this month [weeklynews]': true,
                  'Message Timestamp [weeklynews]': ts,
                  'Asked by [weeklynews]': message.user
                })
                done()
              }, () => {
                convo.say(`All messages have been sent, you just have to wait for answers now :wink:`)
                convo.next()
              })
            } catch (e) {
              reject(e)
            }
          }
        },
        {
          pattern: 'no',
          callback: function (reply, convo) {
            convo.gotoThread('default')
          }
        },
        {
          pattern: 'later',
          callback: function (reply, convo) {
            convo.say('Okay, maybe later!')
            convo.next()
          }
        },
        {
          default: true,
          callback: function () {
            convo.repeat()
            convo.next()
          }
        }

      ], {}, 'completed')

      convo.on('end', () => resolve())
    })
  } catch (e) {
    reject(e)
  }
})
