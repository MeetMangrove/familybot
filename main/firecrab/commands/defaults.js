import controller, { log } from '../config'

const dialog = (convo, slackId, context) => {
  switch (context) {
    case 'hello': {
      convo.say([`Hello  <@${slackId}>!`, `Hey  <@${slackId}>!`, `Aloha  <@${slackId}>!`, `Yo <@${slackId}>!`, `Hi <@${slackId}>!`][Math.floor(Math.random() * 5)])
      break
    }
    case 'intro': {
      convo.say(`Hi <@${slackId}> :heart_eyes:`)
      convo.say(`Welcome to Mangrove :flag-mangrove:`)
      convo.say(`I'm <@${convo.context.bot.identity.id}>!`)
      convo.say(`I gather the Mangrove fire.`)
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
  convo.say(`You can write */done* in <#C1JCYV3S8> to share your contributions with Mangrove`)
  convo.say(`and */thanks* in <#C7PP2P7KQ> to show someone your gratitude.`)
  convo.say(`I'll share an activity summary in <#C0KD37VUP> every Sunday at 6PM Paris time :fire:`)
}

controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) log('the `hello` conversation', err)
    dialog(convo, message.user, 'hello')
  })
})

controller.hears('[^\n]+', ['direct_message', 'direct_mention'], (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) log('the `default` conversation', err)
    dialog(convo, message.user, 'error')
  })
})

controller.on('team_join', (bot, { user }) => {
  bot.startPrivateConversation({ user: user.id }, (err, convo) => {
    if (err) log('the `team_join` conversation', err)
    dialog(convo, user.id, 'intro')
  })
})
