/**
 * Created by thomasjeanneau on 09/04/2017.
 */

import { saveProfile } from './methods'
import { controller } from './config'
import askForUpdate from './askForUpdate'

// User commands
controller.hears(['fresh'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    bot.startConversation(message, function (err, convo) {
      if (err) throw new Error(err)
      convo.addMessage(`Hi <@${message.user}>!`, 'default')
      convo.addMessage(`Let's check your information.`, 'default')
      askForUpdate({ bot, convo, slackId: message.user })
    })
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur during your \`fresh\` command: \`${e.message || e.error || e}\``)
  }
})

controller.hears(['profiles'], ['direct_message', 'direct_mention'], async (bot, message) => {
  bot.startConversation(message, function (err, convo) {
    if (err) throw new Error(err)
    convo.addMessage(`Hi <@${message.user}>!`, 'default')
    convo.addMessage('You can check other Mangrovers\' profiles <https://airtable.com/shrdV73su7MGjffEN|by clicking here!> :man-woman-girl-boy:', 'default')
  })
})

const dialog = (convo, slackId, context) => {
  switch (context) {
    case 'hello': {
      convo.say(`Hello <@${slackId}> :slightly_smiling_face:`)
      break
    }
    case 'intro': {
      convo.say(`Hi <@${slackId}> :sunglasses:`)
      convo.say(`Welcome in Mangrove :flag-mangrove:`)
      convo.say(`I'm <@${convo.context.bot.identity.id}>!`)
      convo.say(`I like fresh news about Mangrovers.`)
      break
    }
    case 'error': {
      convo.say(`Sorry <@${slackId}>, but I'm too young to understand what you mean :flushed:`)
      break
    }
    default: {
      convo.say(`Hello <@${slackId}> :slightly_smiling_face:`)
      break
    }
  }
  convo.say(`Say \`fresh\` if you want me to update your profile`)
  convo.say(`or \`profiles\` if you want to see others Mangrovers' profiles.`)
  convo.say(`I'll share your updates in <#C0KD37VUP> every wednesday at 6PM :rocket:`)
}

controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) throw new Error(err)
    dialog(convo, message.user, 'hello')
  })
})

controller.hears('[^\n]+', ['direct_message', 'direct_mention'], (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) throw new Error(err)
    dialog(convo, message.user, 'error')
  })
})

controller.on('team_join', (bot, { user }) => {
  bot.startPrivateConversation({ user: user.id }, (err, convo) => {
    if (err) throw new Error(err)
    dialog(convo, user.id, 'intro')
  })
})

// TODO: End the addition of skills and interests
controller.middleware.receive.use(function validateDialog (bot, message, next) {
  if (message.type === 'dialog_submission') {
    if (message.submission['Skills'] > 100) {
      bot.dialogError({
        'name': 'number',
        'error': 'Please specify a value below 100'
      })
      return
    }
  }
  next()
})

controller.on('dialog_submission', async function (bot, message) {
  try {
    bot.dialogOk()
    const isUpdated = await saveProfile(message.user, message.submission)
    bot.startConversation(message, (err, convo) => {
      if (err) throw new Error(err)
      if (isUpdated === true) convo.say('Your profile has been freshed!')
      convo.say('If you want, you can check other Mangrovers\' profiles <https://airtable.com/shrdV73su7MGjffEN|by clicking here!> :man-woman-girl-boy:')
      convo.say('See you! :wave:')
    })
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur during your submission: \`${e.message || e.error || e}\``)
  }
})

export default controller
