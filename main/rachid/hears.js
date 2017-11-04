/**
 * Created by thomasjeanneau on 09/04/2017.
 */

import { getSlackUser, errorMessage } from '../methods'
import { controller } from './config'
import giveMood from './giveMood'
import getMood from './getMood'

// User Commands
controller.hears(['^mood$'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    const {name} = await getSlackUser(bot, message.user)
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      giveMood({ bot, convo, name, id: message.user })
    })
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

controller.hears(['^daily'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    const {name} = await getSlackUser(bot, message.user)
    await getMood(bot, message.user, name)
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    const {name} = await getSlackUser(bot, message.user)
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      convo.say(`Hi ${name}! I'm Rachid!`)
      convo.say(`You can say \`mood\` to save your mood`)
      convo.say(`And also \`daily\` to see last Mangrovers' mood`)
      convo.say(`I'll share your mood in <#C7Q1V7V7H> every day at 7PM :sunglasses:`)
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
      convo.say(`You can say \`mood\` to save your mood`)
      convo.say(`And also \`daily\` to see last Mangrovers' mood`)
      convo.say(`I'll share your mood in <#C7Q1V7V7H> every day at 7PM :sunglasses:`)
    })
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

export default controller
