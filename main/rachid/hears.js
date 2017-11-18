/**
 * Created by thomasjeanneau on 09/04/2017.
 */

import { controller } from './config'
import giveMood from './giveMood'
import getMood from './getMood'

// User Commands
controller.hears(['mood$'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      giveMood({ bot, convo, slackId: message.user })
    })
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur during your \`mood\` command: \`${e.message || e.error || e}\``)
  }
})

controller.hears(['daily'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    await getMood({ bot, channel: message.user, slackId: message.user })
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur during your \`daily\` command: \`${e.message || e.error || e}\``)
  }
})

const dialog = async (bot, message, isError) => {
  bot.startConversation(message, function (err, convo) {
    if (err) return console.log(err)
    convo.say(isError === true ? `Sorry <@${message.user}>, but I'm too young to understand what you mean :flushed:` : `Hi <@${message.user}>! I'm <@${bot.id}>!`)
    convo.say(`You can say \`mood\` to save your mood`)
    convo.say(`or \`daily\` if you want to see last Mangrovers' moods.`)
    convo.say(`I'll share your mood in <#C7Q1V7V7H> every day at 7PM :tada:`)
  })
}

controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], (bot, message) => dialog(bot, message, false))
controller.hears('[^\n]+', ['direct_message', 'direct_mention'], (bot, message) => dialog(bot, message, true))
controller.on('team_join', (bot, message) => dialog(bot, message, false))

export default controller
