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

// User commands
const dialog = (convo, slackId, context) => {
  switch (context) {
    case 'hello': {
      convo.say(`Hello <@${slackId}> :slightly_smiling_face:`)
      break
    }
    case 'intro': {
      convo.say(`Hi <@${slackId}> :heart_eyes:`)
      convo.say(`Welcome in Mangrove :flag-mangrove:`)
      convo.say(`I'm <@${convo.context.bot.identity.id}>!`)
      convo.say(`I gather all the Mangrove fire.`)
      break
    }
    case 'error': {
      convo.say(`Sorry <@${slackId}>, but I'm too young to understand what you mean :flushed:`)
      break
    }
    default: {
      convo.say(`Hello <@${slackId}> :slightly_smiling_face:`)
      break
    }
  }
  convo.say(`If you are active in Mangrove, you can say */done* in <#C1JCYV3S8> or */thanks* in <#C7PP2P7KQ>`)
  convo.say(`I'll share your activity in <#C0KD37VUP> every sunday at 7PM :fire:`)
}

controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) return console.log(err)
    dialog(convo, message.user, 'hello')
  })
})

controller.hears('[^\n]+', ['direct_message', 'direct_mention'], (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) return console.log(err)
    dialog(convo, message.user, 'error')
  })
})

controller.on('team_join', (bot, { user }) => {
  bot.startPrivateConversation({ user: user.id }, (err, convo) => {
    if (err) return console.log(err)
    dialog(convo, user.id, 'intro')
  })
})

export default controller
