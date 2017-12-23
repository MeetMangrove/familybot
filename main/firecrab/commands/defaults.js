import controller, { log } from '../config'

const dialog = (convo, slackId, context) => {
  switch (context) {
    case 'hello': {
      convo.say(`Hi <@${slackId}> :slightly_smiling_face:`)
      break
    }
    case 'intro': {
      convo.say(`Hi <@${slackId}> :heart_eyes:`)
      convo.say(`Welcome in Mangrove :flag-mangrove:`)
      convo.say(`I'm <@${convo.context.bot.identity.id}>!`)
      convo.say(`I gather all the Mangrove fire.`)
      break
    }
    case 'error': {
      convo.say(`Sorry <@${slackId}>, but I'm too young to understand what you mean :flushed:`)
      break
    }
    default: {
      convo.say(`Hello <@${slackId}> :slightly_smiling_face:`)
      break
    }
  }
  convo.say(`Thanks to me, you can say */done* in <#C1JCYV3S8> to share your mangrove contribution`)
  convo.say(`and */thanks* in <#C7PP2P7KQ> to show your gratitude to someone.`)
  convo.say(`I'll share all activities in <#C0KD37VUP> every sunday at 6PM Paris time :fire:`)
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
