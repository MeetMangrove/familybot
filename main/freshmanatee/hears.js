/**
 * Created by thomasjeanneau on 09/04/2017.
 */

import { saveProfile } from './methods'
import { controller } from './config'
import askForUpdate from './askForUpdate'

// Responsible Commands
controller.hears(['fresh'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      convo.addMessage(`Hi <@${message.user}>!`, 'default')
      convo.addMessage(`Let's check your information.`, 'default')
      askForUpdate({ bot, convo, slackId: message.user })
    })
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur during your \`fresh\` command: \`${e.message || e.error || e}\``)
  }
})

// Responsible Commands
controller.hears(['profiles'], ['direct_message', 'direct_mention'], async (bot, message) => {
  bot.startConversation(message, function (err, convo) {
    if (err) return console.log(err)
    convo.addMessage(`Hi <@${message.user}>!`, 'default')
    convo.addMessage('You can check other Mangrovers\' profiles <https://airtable.com/shrdV73su7MGjffEN|by clicking here!> :man-woman-girl-boy:', 'default')
  })
})

// User Commands
const dialog = async (bot, message, isError) => {
  bot.startConversation(message, function (err, convo) {
    if (err) return console.log(err)
    convo.say(isError === true ? `Sorry <@${message.user}>, but I'm too young to understand what you mean :flushed:` : `Hi <@${message.user}>! I'm <@${bot.id}>!`)
    convo.say(`Say \`fresh\` if you want me to update your profile`)
    convo.say(`or \`profiles\` if you want to see others Mangrovers' profiles.`)
    convo.say(`I'll share your updates in <#C0KD37VUP> every wednesday at 7PM :rocket:`)
  })
}

controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], (bot, message) => dialog(bot, message, false))
controller.hears('[^\n]+', ['direct_message', 'direct_mention'], (bot, message) => dialog(bot, message, true))
controller.on('team_join', (bot, message) => dialog(bot, message, false))

controller.on('dialog_submission', async function (bot, message) {
  bot.dialogOk()
  try {
    const isUpdated = await saveProfile(message.user, message.submission)
    if (isUpdated === true) {
      bot.say({
        text: 'Your profile has been freshed!',
        channel: message.channel
      }, () => bot.say({
        text: 'If you want, you can check other Mangrovers\' profiles <https://airtable.com/shrdV73su7MGjffEN|by clicking here!> :man-woman-girl-boy:',
        channel: message.channel
      }, () => bot.say({
        text: 'See you! :wave:',
        channel: message.channel
      })))
    }
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur during your submission: \`${e.message || e.error || e}\``)
  }
})

export default controller
