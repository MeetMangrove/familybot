import controller, { log } from '../config'

controller.hears('mangrovers', ['direct_message', 'direct_mention'], async (bot, message) => {
  bot.startPrivateConversation(message, function (err, convo) {
    if (err) log('the `show_mangrovers` conversation', err)
    convo.say([`Hello  <@${message.user}>!`, `Hey  <@${message.user}>!`, `Aloha  <@${message.user}>!`, `Yo <@${message.user}>!`, `Hi <@${message.user}>!`][Math.floor(Math.random() * 5)])
    convo.say('Check other Mangrovers\' profiles <https://airtable.com/shrdV73su7MGjffEN|by clicking here!> :man-woman-girl-boy:')
    convo.say(`Viva la Mangrove family :heart:`)
  })
})
