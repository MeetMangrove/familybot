import controller, { log } from '../config'
import freshLearning from '../methods/convo/fresh_learning'

controller.hears('learning', 'direct_message', (bot, message) => {
  bot.startPrivateConversation(message, (err, convo) => {
    if (err) log('the `learning` conversation', err)
    convo.say(`Hi <@${message.user}>!`)
    convo.say('I\'m looking for your learning :sleuth_or_spy:')
    convo.on('end', (convo) => freshLearning(bot, message, convo))
  })
})
