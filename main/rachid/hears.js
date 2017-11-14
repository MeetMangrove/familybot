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

const dialog = async (bot, message, isError) => {
  try {
    const { name } = await getSlackUser(bot, message.user)
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      convo.say(isError === true ? `Sorry ${name}, but I'm too young to understand what you mean :flushed:` : `Hi ${name}! I'm <@moodbot>!`)
      convo.say(`You can say \`mood\` to save your mood`)
      convo.say(`or \`daily\` if you want to see last Mangrovers' moods`)
      convo.say(`I'll share your mood in <#C7Q1V7V7H> every day at 7PM :tada:`)
    })
  } catch (e) {
    errorMessage(e, bot, message)
  }
}

controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], (bot, message) => dialog(bot, message, false))
controller.hears('[^\n]+', ['direct_message', 'direct_mention'], (bot, message) => dialog(bot, message, true))
controller.on('team_join', (bot, message) => dialog(bot, message, false))

export default controller
