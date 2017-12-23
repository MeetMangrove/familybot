import getMood from '../methods/convo/get_mood'
import controller, { log } from '../config'

controller.hears('daily', 'direct_message', (bot, message) => {
  bot.startPrivateConversation(message, (err, convo) => {
    if (err) log('the `daily` conversation', err)
    convo.say(`Yo <@${message.user}>!`)
    convo.on('end', () => getMood(bot, message))
  })
})
