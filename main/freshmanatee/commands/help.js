import controller, { log } from '../config'
import help from '../methods/convo/help'

controller.hears('help', 'direct_message', (bot, message) => {
  bot.startPrivateConversation(message, (err, convo) => {
    if (err) log('the `learning` conversation', err)
    convo.say([`Hello  <@${message.user}>!`, `Hey  <@${message.user}>!`, `Aloha  <@${message.user}>!`, `Yo <@${message.user}>!`, `Hi <@${message.user}>!`][Math.floor(Math.random() * 5)])
    convo.on('end', () => help(bot, message))
  })
})
