/**
 * Created by thomasjeanneau on 09/04/2017.
 */

import moment from 'moment'

import { controller, isProd } from './config'
import giveMood from './giveMood'
import getMood from './getMood'
import { base, getMember } from '../airtable'

// User commands
controller.hears(['mood$'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    bot.startConversation(message, function (err, convo) {
      if (err) throw new Error(err)
      giveMood({ bot, convo, slackId: message.user })
    })
  } catch (e) {
    console.log(e)
    bot.reply(message, `What? :scream: My \`mood\` command is broken: \`${e.message || e.error || e}\``)
  }
})

controller.hears(['daily'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    await getMood({ bot, channel: message.user, slackId: message.user })
  } catch (e) {
    console.log(e)
    bot.reply(message, `What? :scream: My  \`daily\` command is broken: \`${e.message || e.error || e}\``)
  }
})

const dialog = (convo, slackId, context) => {
  switch (context) {
    case 'hello': {
      convo.say(`Hello <@${slackId}> :slightly_smiling_face:`)
      break
    }
    case 'intro': {
      convo.say(`Hi <@${slackId}> :smile:`)
      convo.say(`Welcome in Mangrove :flag-mangrove:`)
      convo.say(`I'm <@${convo.context.bot.identity.id}>!`)
      convo.say(`I ask about Mangrovers mood every day.`)
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
  convo.say(`You can say \`mood\` to save your mood`)
  convo.say(`or \`daily\` if you want to see last Mangrovers' moods.`)
  convo.say(`I'll share your mood in <#C7Q1V7V7H> every day at 7PM :tada:`)
}

controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], (bot, message) => {
  try {
    bot.startConversation(message, (err, convo) => {
      if (err) throw new Error(err)
      dialog(convo, message.user, 'hello')
    })
  } catch (e) {
    console.log(e)
    bot.say({
      text: `What? :scream: A little error occur during the message of <@${message.user.id}>: \`${e.message || e.error || e}\``,
      channel: isProd ? '#mangrove-tech' : '#ghost-playground'
    })
  }
})

controller.hears('[^\n]+', ['direct_message', 'direct_mention'], (bot, message) => {
  try {
    bot.startConversation(message, (err, convo) => {
      if (err) throw new Error(err)
      dialog(convo, message.user, 'error')
    })
  } catch (e) {
    console.log(e)
    bot.say({
      text: `What? :scream: A little error occur during the message of <@${message.user.id}>: \`${e.message || e.error || e}\``,
      channel: isProd ? '#mangrove-tech' : '#ghost-playground'
    })
  }
})

controller.on('team_join', (bot, { user }) => {
  try {
    if (user.is_bot === false) {
      bot.startPrivateConversation({ user: user.id }, (err, convo) => {
        if (err) throw new Error(err)
        dialog(convo, user.id, 'intro')
      })
      base('Members').create({
        'Name': user.real_name,
        'Member Since': moment().format('YYYY-MM-DD'),
        'Status': 'Guest',
        'Email': user.profile.email,
        'Profile Picture': [{ 'url': user.profile.image_512 }],
        'Old Points': 0,
        'OldDones': 0,
        'Slack ID': user.id
      }, (err, record) => {
        if (err) throw new Error(err)
        console.log(`New Mangrover:`, record.fields)
      })
    }
  } catch (e) {
    console.log(e)
    bot.say({
      text: `What? :scream: A little error occur during the team join of <@${user.id}>: \`${e.message || e.error || e}\``,
      channel: isProd ? '#mangrove-tech' : '#ghost-playground'
    })
  }
})

controller.on('user_change', async (bot, { user }) => {
  try {
    if (user.is_bot === false && user.deleted === false) {
      const { id: airtableId } = await getMember(user.id)
      base('Members').update(airtableId, {
        'Name': user.real_name,
        'Email': user.profile.email,
        'Profile Picture': [{ 'url': user.profile.image_512 }]
      }, (err, record) => {
        if (err) throw new Error(err)
        console.log(`Mangrover's profile updated:`, record.fields)
      })
    }
  } catch (e) {
    console.log(e)
    bot.say({
      text: `What? :scream: A little error occur during the profile change of <@${user.id}>: \`${e.message || e.error || e}\``,
      channel: isProd ? '#mangrove-tech' : '#ghost-playground'
    })
  }
})

export default controller
