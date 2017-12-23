import giveMood from '../methods/convo/give_mood'
import controller, { log } from '../config'

controller.hears('mood.js', 'direct_message', (bot, message) => {
  bot.startPrivateConversation(message, (err, convo) => {
    if (err) log('the `mood.js` conversation', err)
    convo.say(`Yo <@${message.user}>!`)
    convo.on('end', () => giveMood(bot, message))
  })
})
