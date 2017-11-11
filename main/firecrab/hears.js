import _ from 'lodash'
import Promise from 'bluebird'
import { controller } from './config'

import { saveDone, saveThanks, errorMessage, getSlackUser } from '../methods'

String.prototype.splice = function(idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
}

controller.on('slash_command', async function (bot, message) {
  bot.replyAcknowledge()
  try {

    const { text } = message
    const date = Date.now()
    const apiUser = Promise.promisifyAll(bot.api.users)

    switch (message.command) {
      case '/done':
        bot.whisper(message, 'Your */done* is saving...')
        await saveDone(message.user_name, text, date)
        const { user: { profile: { real_name, image_192 } } } = await apiUser.infoAsync({ user: message.user })
        bot.whisper(message, 'Your */done* has been saved :clap:', (err) => {
          if(err) console.log(err)
          bot.say({
            attachments: [{
              'author_name': `${real_name}`,
              'text': `*done* ${text}`,
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
        const thanksTo = []
        const regEx = /\s?@[a-z._]+/g
        let name
        let embed = text
        do {
          name = regEx.exec(embed)
          if (name) {
            thanksTo.push(name[0].trim().replace(/^@/, ''))
            if (name[0].match(/\s@[a-z._]+/g)) {
              embed = embed.splice(name.index + 1, 0, '<')
            } else {
              embed = embed.splice(name.index, 0, '<')
            }
            embed = embed.splice(name.index + name[0].length + 1, 0, '>')
          }
        } while (name)
        const { members } = await apiUser.listAsync({ token: bot.config.bot.app_token })
        if (thanksTo.length === 0 || _.difference(thanksTo, _.map(members, 'name')).length !== 0) {
          const notValid= _.difference(thanksTo, _.map(members, 'name'))
          bot.whisper(message, `This values are not valid: ${notValid.map(name => `<@${name}>`)}\nTry again!`)
        } else {
          const thanksText = embed.slice(embed.indexOf(thanksTo[thanksTo.length - 1]) + thanksTo[thanksTo.length - 1].length + 1).trim()
          await saveThanks(message.user_name, thanksTo, thanksText, date)
          const { user: { profile: { real_name, image_192 } } } = await apiUser.infoAsync({ user: message.user })
          bot.whisper(message, 'Your */thanks* has been saved :relaxed:', (err) => {
            if(err) console.log(err)
            bot.say({
              attachments: [{
                'author_name': `${real_name}`,
                'text': `*thanks* ${embed}`,
                'color': '#E57373',
                'thumb_url': image_192,
                'mrkdwn_in': ['text']
              }],
              channel: '#dev-test'
            })
          })
        }
        break
      default:
        bot.whisper(message, 'Sorry, I\'m not sure what that command is')
    }
  } catch (e) {
    console.log(e)
    bot.whisper(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
})

// User Commands
controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    const { name } = await getSlackUser(bot, message.user)
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      convo.say(`Hi ${name}! I'm Fire Crab!`)
      convo.say(`If you are active in Mangrove, you can say */done* in <#C1JCYV3S8> or */thanks* in <#C7PP2P7KQ>`)
      convo.say(`I'll share your activity every sunday at 7PM :fire:`)
    })
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

controller.hears('[^\n]+', ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    const { name } = await getSlackUser(bot, message.user)
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      convo.say(`Sorry ${name}, but I'm too young to understand what you mean :flushed:`)
      convo.say(`If you are active in Mangrove, you can say */done* in <#C1JCYV3S8> or */thanks* in <#C7PP2P7KQ>`)
      convo.say(`I'll share your activity every sunday at 7PM :fire:`)
    })
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

export default controller