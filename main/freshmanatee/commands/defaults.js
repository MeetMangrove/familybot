import controller, { log } from '../config'
import help from '../methods/convo/help'

const dialog = (bot, convo, slackId, context) => {
  switch (context) {
    case 'hello': {
      convo.say([`Hello  <@${slackId}>!`, `Hey  <@${slackId}>!`, `Aloha  <@${slackId}>!`, `Yo <@${slackId}>!`, `Hi <@${slackId}>!`][Math.floor(Math.random() * 5)])
      break
    }
    case 'intro': {
      convo.say(`Hi <@${slackId}> :sunglasses:`)
      convo.say(`Welcome to Mangrove :flag-mangrove:`)
      convo.say(`I'm <@${convo.context.bot.identity.id}>!`)
      convo.say(`I like getting fresh news from Mangrovers.`)
      break
    }
    case 'error': {
      convo.say(`Sorry <@${slackId}>, I'm too young to understand what you mean :flushed:`)
      break
    }
    default: {
      convo.say([`Hello  <@${slackId}>!`, `Hey  <@${slackId}>!`, `Aloha  <@${slackId}>!`, `Yo <@${slackId}>!`, `Hi <@${slackId}>!`][Math.floor(Math.random() * 5)])
      break
    }
  }
  convo.on('end', () => help(bot, { user: slackId }))
}

controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) log('the `hello` conversation', err)
    dialog(bot, convo, message.user, 'hello')
  })
})

controller.hears('[^\n]+', ['direct_message', 'direct_mention'], (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) log('the `default` conversation', err)
    dialog(bot, convo, message.user, 'error')
  })
})

controller.on('team_join', (bot, { user }) => {
  bot.startPrivateConversation({ user: user.id }, (err, convo) => {
    if (err) log('the `team_join` conversation', err)
    dialog(bot, convo, user.id, 'intro')
  })
})
