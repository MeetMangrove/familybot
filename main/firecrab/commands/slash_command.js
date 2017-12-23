/* eslint-disable camelcase */
import _ from 'lodash'
import Promise from 'bluebird'

import controller, { log, isProd } from '../config'
import { saveDone, saveThanks, parseSlackMessage } from '../methods/index'

controller.on('slash_command', async function (bot, message) {
  bot.replyAcknowledge()
  try {
    const { text } = message
    const date = Date.now()
    const apiUser = Promise.promisifyAll(bot.api.users)
    switch (message.command) {
      case '/done':
      case '/g-done':
        bot.whisper(message, 'Your */done* is saving...')
        await saveDone(message.user, text, date)
        const { user: { profile: { real_name, image_192 } } } = await apiUser.infoAsync({ user: message.user })
        bot.whisper(message, 'Your */done* has been saved :clap:', (err) => {
          if (err) log('the `/done` saved message', err)
          bot.say({
            attachments: [{
              author_name: `${real_name}`,
              text: `*done* ${parseSlackMessage(text)}`,
              color: '#81C784',
              thumb_url: image_192,
              mrkdwn_in: ['text']
            }],
            channel: isProd ? '#done' : '#ghost-playground'
          })
        })
        break
      case '/thanks':
      case '/g-thanks':
        bot.whisper(message, 'Your */thanks* is saving...')
        let thanksTo = []
        const regEx = /\s?@[a-z._0-9]+/g
        let name
        do {
          name = regEx.exec(text)
          if (name) {
            thanksTo.push(name[0].trim().replace(/^@/, ''))
          }
        } while (name)
        const { members } = await apiUser.listAsync({ token: bot.config.bot.app_token })
        if (thanksTo.length === 0 || _.difference(thanksTo, _.map(members, 'name')).length !== 0) {
          const notValid = _.difference(thanksTo, _.map(members, 'name'))
          bot.whisper(message, `This values are not valid: ${notValid.map(name => `<@${name}>`)}\nTry again!`)
        } else {
          const thanksText = text.slice(text.indexOf(thanksTo[thanksTo.length - 1]) + thanksTo[thanksTo.length - 1].length).trim()
          thanksTo = _.map(thanksTo, name => _.find(members, { name }).id)
          await saveThanks(message.user, thanksTo, thanksText, date)
          const { user: { profile: { real_name, image_192 } } } = await apiUser.infoAsync({ user: message.user })
          bot.whisper(message, 'Your */thanks* has been saved :relaxed:', (err) => {
            if (err) log('the `/thanks` saved message', err)
            bot.say({
              attachments: [{
                author_name: `${real_name}`,
                text: `*thanks* ${parseSlackMessage(text)}`,
                color: '#E57373',
                thumb_url: image_192,
                mrkdwn_in: ['text']
              }],
              channel: isProd ? '#thanks' : '#ghost-playground'
            })
          })
        }
        break
      default:
        bot.whisper(message, 'Sorry, I\'m not sure what that command is...')
    }
  } catch (e) {
    log('the `slash_command` reception', e)
  }
})
