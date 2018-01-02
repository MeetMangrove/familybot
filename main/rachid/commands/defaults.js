/**
 * Created by thomasjeanneau on 09/04/2017.
 */

import moment from 'moment'

import controller, { log } from '../config'
import { base, getMember } from '../../api/airtable'

const dialog = (convo, slackId, context) => {
  switch (context) {
    case 'hello': {
      convo.say([`Hello  <@${slackId}>!`, `Hey  <@${slackId}>!`, `Aloha  <@${slackId}>!`, `Yo <@${slackId}>!`, `Hi <@${slackId}>!`][Math.floor(Math.random() * 5)])
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
      convo.say([`Hello  <@${slackId}>!`, `Hey  <@${slackId}>!`, `Aloha  <@${slackId}>!`, `Yo <@${slackId}>!`, `Hi <@${slackId}>!`][Math.floor(Math.random() * 5)])
      break
    }
  }
  convo.say(`You can say \`mood\` to save your mood`)
  convo.say(`or \`daily\` if you want to see last Mangrovers' moods.`)
  convo.say(`I'll share your mood in <#C7Q1V7V7H> every day at 7PM Paris time :tada:`)
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
  if (user.is_bot === false) {
    bot.startPrivateConversation({ user: user.id }, (err, convo) => {
      if (err) log('the `team_join` conversation', err)
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
      if (err) log('the `create member` airtable process', err)
      console.log(`New Mangrover:`, record.fields)
    })
  }
})

controller.on('user_change', async (bot, { user }) => {
  if (user.is_bot === false && user.deleted === false) {
    const { id: airtableId } = await getMember(user.id)
    base('Members').update(airtableId, {
      'Name': user.real_name,
      'Email': user.profile.email,
      'Profile Picture': [{ 'url': user.profile.image_512 }]
    }, (err, record) => {
      if (err) log('the `update member` airtable process', err)
      console.log(`Mangrover's profile updated:`, record.fields)
    })
  }
})
