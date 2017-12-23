import controller, { log } from '../config'
import freshSkill from '../methods/convo/fresh_skill'

controller.hears('skills', 'direct_message', (bot, message) => {
  bot.startPrivateConversation(message, (err, convo) => {
    if (err) log('the `skills` conversation', err)
    convo.say(`Hi <@${message.user}>!`)
    convo.say('I\'m looking for your skills :sleuth_or_spy:')
    convo.on('end', (convo) => freshSkill(bot, message, convo))
  })
})
