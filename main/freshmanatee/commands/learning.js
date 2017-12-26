import controller, { log } from '../config'
import freshLearning from '../methods/convo/fresh_learning'

controller.hears('learning', 'direct_message', (bot, message) => {
  bot.startPrivateConversation(message, (err, convo) => {
    if (err) log('the `learning` conversation', err)
    convo.say([`Hello  <@${message.user}>!`, `Hey  <@${message.user}>!`, `Aloha  <@${message.user}>!`, `Yo <@${message.user}>!`, `Hi <@${message.user}>!`][Math.floor(Math.random() * 5)])
    convo.say('I\'m looking for your learning :sleuth_or_spy:')
    convo.on('end', (convo) => freshLearning(bot, message, convo))
  })
})
