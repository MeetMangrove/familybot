import controller, { log } from '../config'
import freshProfile from '../methods/convo/fresh_profile'

controller.hears('fresh', 'direct_message', (bot, message) => {
  bot.createPrivateConversation(message, (err, convo) => {
    if (err) log('the `fresh` conversation', err)
    convo.setTimeout(1500000)
    convo.addMessage({
      text: [`Hello  <@${message.user}>!`, `Hey  <@${message.user}>!`, `Aloha  <@${message.user}>!`, `Yo <@${message.user}>!`, `Hi <@${message.user}>!`][Math.floor(Math.random() * 5)]
    }, 'default')
    convo.addMessage({
      text: ['Let\'s check your information.'],
      action: 'fresh_profile'
    }, 'default')
    freshProfile(convo)
    convo.addMessage(`Okay, see you! :wave:`, 'exit')
    convo.addMessage('You seem busy. Say `fresh` when you come back!', 'on_timeout')
    convo.activate()
  })
})
