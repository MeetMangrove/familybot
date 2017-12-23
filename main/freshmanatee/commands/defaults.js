import controller, { log } from '../config'

const dialog = (convo, slackId, context) => {
  switch (context) {
    case 'hello': {
      convo.say(`Hello <@${slackId}> :slightly_smiling_face:`)
      break
    }
    case 'intro': {
      convo.say(`Hi <@${slackId}> :sunglasses:`)
      convo.say(`Welcome in Mangrove :flag-mangrove:`)
      convo.say(`I'm <@${convo.context.bot.identity.id}>!`)
      convo.say(`I like fresh news about Mangrovers.`)
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
  convo.say(`Say \`fresh\` if you want me to share your latest news, goals and challenges,`)
  convo.say(`\`skills\` or \`learning\` to manage your skills & learning`)
  convo.say(`and \`mangrovers\` if you want to see others Mangrovers' profiles.`)
  convo.say(`I'll share your updates in <#C0KD37VUP> every wednesday at 6PM Paris time :rocket:`)
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
