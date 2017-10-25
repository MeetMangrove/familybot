/**
 * Created by thomasjeanneau on 09/04/2017.
 */

import { getSlackUser, saveProfile } from '../methods'
import { controller } from './config'
import askForUpdate from './askForUpdate'

const errorMessage = (e, bot, message) => {
  console.log(e)
  bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
}

// Responsible Commands
controller.hears(['^fresh'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    const { name } = await getSlackUser(bot, message.user)
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      convo.addMessage(`Hi ${name}!`, 'default')
      convo.addMessage(`Let's check your information.`, 'default')
      askForUpdate({ bot, convo, name, id: message.user })
    })
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

// User Commands
controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    const { name } = await getSlackUser(bot, message.user)
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      convo.say(`Hi ${name}! I'm Fresh Manatee :tada:`)
      convo.say(`Say \`fresh\` if you want me to update your profile :wink:`)
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
      convo.say(`Say \`fresh\` if you want me to update your profile :wink:`)
    })
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

controller.on('dialog_submission', async function (bot, message) {
  bot.dialogOk()
  try {
    const submission = message.submission;
    const { name } = await getSlackUser(bot, message.user)
    const isUpdated = await saveProfile(name, submission)
    if(isUpdated === true) {
      bot.say({
          text: 'Your profile has been freshed! :raised_hands:',
          channel: message.channel
        }, () => bot.say({
          text: 'See you in two weeks! :wave:',
          channel: message.channel
        })
      )
    }
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

export default controller
