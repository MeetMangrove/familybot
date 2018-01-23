import controller, { log } from '../config'
import freshLearning from '../methods/convo/fresh_learning'

controller.hears('learning', 'direct_message', (bot, message) => {
  bot.createPrivateConversation(message, (err, convo) => {
    if (err) log('the `learning` conversation', err)
    convo.setTimeout(1500000)
    convo.addMessage({
      text: [`Hello  <@${message.user}>!`, `Hey  <@${message.user}>!`, `Aloha  <@${message.user}>!`, `Yo <@${message.user}>!`, `Hi <@${message.user}>!`][Math.floor(Math.random() * 5)],
      action: 'fresh_learning'
    }, 'default')
    freshLearning(convo, message.user)
    convo.addMessage(`Okay, see you! :wave:`, 'exit')
    convo.addMessage('Hum... you seem busy. Come back say `learning` when you want!', 'on_timeout')
    convo.activate()
  })
})
