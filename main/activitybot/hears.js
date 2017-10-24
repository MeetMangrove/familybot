import _ from 'lodash'
import moment from 'moment'
import Promise from 'bluebird'
import { controller } from './config'

require('dotenv').config()

const {
  ACTIVITYBOT_COMMAND_TOKEN_1,
  ACTIVITYBOT_COMMAND_TOKEN_2,
} = process.env

if (!ACTIVITYBOT_COMMAND_TOKEN_1 || !ACTIVITYBOT_COMMAND_TOKEN_2) {
  console.log('Error: Specify ACTIVITYBOT_COMMAND_TOKEN_1 & ACTIVITYBOT_COMMAND_TOKEN_2 in a .env file')
  process.exit(1)
}

controller.on('slash_command', async function (bot, message) {
  try {
    console.log(message)
    // Validate Slack verify token
    if (message.token !== ACTIVITYBOT_COMMAND_TOKEN_1 && message.token !== ACTIVITYBOT_COMMAND_TOKEN_2) {
      return bot.res.send(401, 'Unauthorized')
    }

    const { text } = message
    const date = Date.now()
    const displayDate = moment(date).format('MMMM Do, YYYY')
    const apiUser = Promise.promisifyAll(bot.api.users)
    const { user: { profile: { real_name, image_72 } } } = await apiUser.infoAsync({ user: message.user })

    switch (message.command) {
      case '/done':
        bot.replyPrivate(message, 'Your */done* has been saved :clap:')
        bot.say({
          attachments: [{
            'author_name': `${real_name} `,
            'text': `*done* ${text}\n_${displayDate}_`,
            'color': '#81C784',
            'thumb_url': image_72,
            'mrkdwn_in': ['text']
          }],
          channel: '#done'
        })
        break
      case '/thanks':
        const thanksTo = text.substring(text.indexOf('@') + 1, text.indexOf(' '))
        const { members } = await apiUser.listAsync({ token: bot.config.bot.app_token })
        if (!thanksTo || _.map(members, 'name').indexOf(thanksTo) === -1) {
          bot.replyPrivate(message, `<@${thanksTo}> is not a valid name, try again!`)
        } else {
          bot.replyPrivate(message, 'Your */thanks* has been saved :relaxed:')
          bot.say({
            attachments: [{
              'author_name': `${real_name} `,
              'text': `*thanks* <@${thanksTo}> ${text.substring(text.indexOf(' ') + 1)}\n_${displayDate}_`,
              'color': '#E57373',
              'thumb_url': image_72,
              'mrkdwn_in': ['text']
            }],
            channel: '#thanks'
          })
        }
        break
      default:
        bot.replyPrivate(message, 'Sorry, I\'m not sure what that command is')
    }
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
})

export default controller