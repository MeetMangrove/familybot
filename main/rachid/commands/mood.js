import giveMood from '../methods/convo/give_mood'
import controller, { log } from '../config'

controller.hears('mood', 'direct_message', (bot, message) => {
  bot.startPrivateConversation(message, (err, convo) => {
    if (err) log('the `mood` conversation', err)
    convo.say(`Yo <@${message.user}>!`)
    convo.on('end', () => giveMood(bot, message))
  })
})
