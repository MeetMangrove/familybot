import controller, { log } from '../config'
import freshSkill from '../methods/convo/fresh_skill'

controller.hears('skills', 'direct_message', (bot, message) => {
  bot.startPrivateConversation(message, (err, convo) => {
    if (err) log('the `skills` conversation', err)
    convo.say([`Hello  <@${message.user}>!`, `Hey  <@${message.user}>!`, `Aloha  <@${message.user}>!`, `Yo <@${message.user}>!`, `Hi <@${message.user}>!`][Math.floor(Math.random() * 5)])
    convo.say('I\'m looking for your skills :sleuth_or_spy:')
    convo.on('end', (convo) => freshSkill(bot, message, convo))
  })
})
