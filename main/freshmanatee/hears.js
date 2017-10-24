/**
 * Created by thomasjeanneau on 09/04/2017.
 */

import { getSlackUser } from '../methods'
import { controller } from './config'
import askForUpdate from './askForUpdate'

const errorMessage = (e, bot, message) => {
  console.log(e)
  bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
}

// Responsible Commands

controller.hears(['^update profile$'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    const {name} = await getSlackUser(bot, message.user)
    await askForUpdate({ bot, name, id: message.user })
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

// User Commands

controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    const {name} = await getSlackUser(bot, message.user)
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      convo.say(`Hi ${name}! I'm Fresh Manatee :tada:`)
      convo.say(`Say \`update profile\` if you want me to update your profile :wink:`)
    })
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

controller.hears('[^\n]+', ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    const {name} = await getSlackUser(bot, message.user)
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      convo.say(`Sorry ${name}, but I'm too young to understand what you mean :flushed:`)
      convo.say(`Say \`update profile\` if you want me to update your profile :wink:`)
    })
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

controller.on('interactive_message_callback', function(bot, message) {
  console.log(message)
  bot.replyInteractive(message, {
    text: 'See you in two weeks! :wave:',
    attachments: [
      {
        callback_id: 'update_info',
        attachment_type: 'default',
      }
    ]
  });

});

export default controller
