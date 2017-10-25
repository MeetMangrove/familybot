/**
 * Created by thomasjeanneau on 09/04/2017.
 */

import { getSlackUser } from '../methods'
import { controller } from './config'
import askForUpdate from './askForUpdate'
import updateProfile from './updateProfile'

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
      updateProfile({ bot, message })
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

// use a receive middleware hook to validate a form submission
// and use bot.dialogError to respond with an error before the submission
// can be sent to the handler
controller.middleware.receive.use(function validateDialog(bot, message, next) {
  if (message.type === 'dialog_submission') {
    if (message.submission.number > 100) {
      bot.dialogError({
        "name":"number",
        "error":"Please specify a value below 100"
      });
      return;
    }
  }
  next();
})

controller.on('dialog_submission', function(bot, message) {
  const submission = message.submission;
  console.log(submission)
  bot.reply(message, 'Got it!');

  // call dialogOk or else Slack will think this is an error
  bot.dialogOk();
})

export default controller
