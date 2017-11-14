/**
 * Created by thomasjeanneau on 09/04/2017.
 */

import { getSlackUser, saveProfile, errorMessage } from '../methods'
import { controller } from './config'
import askForUpdate from './askForUpdate'

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
      convo.say(`Hi ${name}! I'm Fresh Manatee!`)
      convo.say(`Say \`fresh\` if you want me to update your profile`)
      convo.say(`I'll share your updates every wednesday at 7PM :rocket:`)
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
      convo.say(`Say \`fresh\` if you want me to update your profile`)
      convo.say(`I'll share your updates every wednesday at 7PM :rocket:`)
    })
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

controller.on('dialog_submission', async function (bot, message) {
  bot.dialogOk()
  try {
    const { name } = await getSlackUser(bot, message.user)
    const isUpdated = await saveProfile(name, message.submission)
    if (isUpdated === true) {
      bot.say({
        text: 'Your profile has been freshed!',
        channel: message.channel
      }, () => bot.say({
        text: 'You can check other Mangrovers\' profiles <https://airtable.com/shrdV73su7MGjffEN|by clicking here!> :man-woman-girl-boy:',
        channel: message.channel
      }, () => bot.say({
        text: 'See you! :wave:',
        channel: message.channel
      })))
    }
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

export default controller
