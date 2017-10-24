/**
 * Created by thomasjeanneau on 27/06/2017.
 */

import Promise from 'bluebird'

import { controller } from './config'

export default async (bot, message) => {
  const getUser = Promise.promisify(controller.storage.users.get)
  const user = await getUser(message.user)
  if (!user || !user.access_token) {
    return new Promise((resolve, reject) => {
      try {
        let token = null
        bot.startPrivateConversation(message, (err, convo) => {
          if (err) return console.log(err)
          convo.addMessage({
            text: `Hum... It seems that you are not authorised yet :thinking_face:`
          }, 'default')

          convo.addQuestion({
            text: 'Follow this link to authorize your account: https://news.mangrove.io/freshmanatee/login',
            attachments: [
              {
                title: 'Is it done?',
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
                  }
                ]
              }
            ]
          }, [
            {
              pattern: 'yes',
              callback: async function (reply, convo) {
                const user = await getUser(message.user)
                if (!user || !user.access_token) {
                  convo.gotoThread('default')
                } else {
                  token = user.access_token
                }
                convo.next()
              }
            },
            {
              pattern: 'no',
              callback: function (reply, convo) {
                convo.say('Okay, come back to me when it\'s done :smile:')
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
          ], {}, 'default')

          convo.on('end', () => resolve(token))
        })
      } catch (e) {
        reject(e)
      }
    })
  } else {
    return user.access_token
  }
}
