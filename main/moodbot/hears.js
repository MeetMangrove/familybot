/**
 * Created by thomasjeanneau on 09/04/2017.
 */

import { getSlackUser } from '../methods'
import { controller } from './config'
import giveMood from './giveMood'
import askForMood from "./askForMood"

const errorMessage = (e, bot, message) => {
  console.log(e)
  bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
}

// User Commands
controller.hears(['^give my mood$'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    const {name} = await getSlackUser(bot, message.user)
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      giveMood(convo, name)
      convo.transitionTo('give_mood', `Hello ${name}! :smile:`);
    })
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    const {name} = await getSlackUser(bot, message.user)
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      convo.addMessage(`Hey ${name}!`, 'default')
      convo.addMessage(`My name is Rachid, I'm the <@moodbot> :smile:`, 'default')
      askForMood(convo, name)
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
      convo.addMessage(`Sorry ${name}, but I'm too young to understand what you mean :flushed:`, 'default')
      askForMood(convo, name)
    })
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

export default controller
