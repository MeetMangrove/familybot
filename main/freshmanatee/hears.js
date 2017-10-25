/**
 * Created by thomasjeanneau on 09/04/2017.
 */

import { getSlackUser, saveProfile } from '../methods'
import { controller } from './config'
import askForUpdate, { profile } from './askForUpdate'

const errorMessage = (e, bot, message) => {
  console.log(e)
  bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
}

// Responsible Commands
controller.hears(['^fresh'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    const { name } = await getSlackUser(bot, message.user)
    await askForUpdate({ bot, name, id: message.user })
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

controller.on('interactive_message_callback', function (bot, message) {
  if (message.callback_id === 'update_info') {
    if (message.actions[0].value === 'yes') {
      const dialog = bot
        .createDialog(
          'Fresh your profile',
          'fresh_profile',
          'Fresh')
        .addTextarea('Bio', 'Bio', profile.get('Bio'), {
          max_length: 500,
          placeholder: 'What are your current projects? What made you happy recently (outside of projects)?'
        })
        .addText('Location', 'Location', profile.get('Location'))
        .addTextarea('Focus', 'Focus', profile.get('Focus'), {
          max_length: 300,
          placeholder: 'Your main focus for the next two weeks? (private)'
        })
        .addTextarea('Challenges', 'Challenges', profile.get('Challenges'), {
          max_length: 300,
          placeholder: 'What challenges do you currently face in your projects and life? (private)'
        })
      bot.replyWithDialog(message, dialog.asObject(), (err, res) => {
        if (err) console.log(err)
        console.log(res)
      })
    } else {
      bot.replyInteractive(message, {
        text: 'See you in two weeks! :wave:',
        attachments: [
          {
            callback_id: 'update_info',
            attachment_type: 'default',
          }
        ]
      })
    }
  }
})

controller.on('dialog_submission', async function (bot, message) {
  try {
    const submission = message.submission;
    await saveProfile(profile, submission)
    bot.reply(message, 'Your profile has been freshed! :raised_hands:', () => {
      bot.say({
        text: 'See you in two weeks! :wave:',
        channel: message.channel
      })
    })
    bot.dialogOk()
  } catch (e) {
    errorMessage(e, bot, message)
  }
})

export default controller
