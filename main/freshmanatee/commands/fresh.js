import controller, { log } from '../config'
import freshProfile from '../methods/convo/fresh_profile'

controller.hears('fresh', 'direct_message', (bot, message) => {
  bot.startPrivateConversation(message, (err, convo) => {
    if (err) log('the `fresh` conversation', err)
    convo.say([`Hello  <@${message.user}>!`, `Hey  <@${message.user}>!`, `Aloha  <@${message.user}>!`, `Yo <@${message.user}>!`, `Hi <@${message.user}>!`][Math.floor(Math.random() * 5)])
    convo.say(`Let's check your information.`)
    convo.on('end', () => freshProfile(bot, message))
  })
})
