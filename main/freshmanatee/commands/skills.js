import controller, { log } from '../config'
import freshSkill from '../methods/convo/fresh_skill'

controller.hears('skills', 'direct_message', (bot, message) => {
  bot.createPrivateConversation(message, (err, convo) => {
    if (err) log('the `skills` conversation', err)
    convo.setTimeout(1500000)
    convo.addMessage({
      text: [`Hello  <@${message.user}>!`, `Hey  <@${message.user}>!`, `Aloha  <@${message.user}>!`, `Yo <@${message.user}>!`, `Hi <@${message.user}>!`][Math.floor(Math.random() * 5)],
      action: 'fresh_skills'
    }, 'default')
    freshSkill(convo)
    convo.addMessage(`Okay, see you! :wave:`, 'exit')
    convo.addMessage('You seem busy. Send `skills` when you feel ready!', 'on_timeout')
    convo.activate()
  })
})
