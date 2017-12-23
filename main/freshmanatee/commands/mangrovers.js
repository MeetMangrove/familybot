import controller, { log } from '../config'

controller.hears('mangrovers', ['direct_message', 'direct_mention'], async (bot, message) => {
  bot.startPrivateConversation(message, function (err, convo) {
    if (err) log('the `show_mangrovers` conversation', err)
    convo.say(`Hi <@${message.user}>!`)
    convo.say('You can check other Mangrovers\' profiles <https://airtable.com/shrdV73su7MGjffEN|by clicking here!> :man-woman-girl-boy:')
    convo.say(`Viva la Mangrove family :heart:`)
  })
})
