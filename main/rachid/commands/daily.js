import getMood from '../methods/convo/get_mood'
import controller, { log } from '../config'

controller.hears('daily', 'direct_message', (bot, message) => {
  bot.startPrivateConversation(message, (err, convo) => {
    if (err) log('the `daily` conversation', err)
    convo.say([`Hello  <@${message.user}>!`, `Hey  <@${message.user}>!`, `Aloha  <@${message.user}>!`, `Yo <@${message.user}>!`, `Hi <@${message.user}>!`][Math.floor(Math.random() * 5)])
    convo.on('end', () => getMood(bot, message))
  })
})
