/* eslint-disable camelcase */
import _ from 'lodash'
import Promise from 'bluebird'

import { controller } from './config'
import { saveDone, saveThanks, parseSlackMessage } from './methods'

// Slash commands
controller.on('slash_command', async function (bot, message) {
  bot.replyAcknowledge()
  try {
    const { text } = message
    const date = Date.now()
    const apiUser = Promise.promisifyAll(bot.api.users)
    switch (message.command) {
      case '/done':
        bot.whisper(message, 'Your */done* is saving...')
        await saveDone(message.user, text, date)
        const { user: { profile: { real_name, image_192 } } } = await apiUser.infoAsync({ user: message.user })
        bot.whisper(message, 'Your */done* has been saved :clap:', (err) => {
          if (err) console.log(err)
          bot.say({
            attachments: [{
              'author_name': `${real_name}`,
              'text': `*done* ${parseSlackMessage(text)}`,
              'color': '#81C784',
              'thumb_url': image_192,
              'mrkdwn_in': ['text']
            }],
            channel: '#done'
          })
        })
        break
      case '/thanks':
        bot.whisper(message, 'Your */thanks* is saving...')
        let thanksTo = []
        const regEx = /\s?@[a-z._]+/g
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
          thanksTo = _.map(thanksTo, name => _.find(members, 'name').id)
          const thanksText = text.slice(text.indexOf(thanksTo[thanksTo.length - 1]) + thanksTo[thanksTo.length - 1].length).trim()
          await saveThanks(message.user, thanksTo, thanksText, date)
          const { user: { profile: { real_name, image_192 } } } = await apiUser.infoAsync({ user: message.user })
          bot.whisper(message, 'Your */thanks* has been saved :relaxed:', (err) => {
            if (err) console.log(err)
            bot.say({
              attachments: [{
                'author_name': `${real_name}`,
                'text': `*thanks* ${parseSlackMessage(text)}`,
                'color': '#E57373',
                'thumb_url': image_192,
                'mrkdwn_in': ['text']
              }],
              channel: '#thanks'
            })
          })
        }
        break
      default:
        bot.whisper(message, 'Sorry, I\'m not sure what that command is')
    }
  } catch (e) {
    console.log(e)
    bot.whisper(message, `Oops..! :sweat_smile: A little error occur in your \`${message.command}\` command: \`${e.message || e.error || e}\``)
  }
})

// User Commands
const dialog = async (bot, message, isError) => {
  bot.startConversation(message, function (err, convo) {
    if (err) return console.log(err)
    convo.say(isError === true ? `Sorry <@${message.user}>, but I'm too young to understand what you mean :flushed:` : `Hi <@${message.user}>! I'm <@${bot.id}>!`)
    convo.say(`If you are active in Mangrove, you can say */done* in <#C1JCYV3S8> or */thanks* in <#C7PP2P7KQ>`)
    convo.say(`I'll share your activity in <#C0KD37VUP> every sunday at 7PM :fire:`)
  })
}

controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], (bot, message) => dialog(bot, message, false))
controller.hears('[^\n]+', ['direct_message', 'direct_mention'], (bot, message) => dialog(bot, message, true))
controller.on('team_join', (bot, message) => dialog(bot, message, false))

export default controller
