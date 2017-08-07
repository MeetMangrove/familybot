/**
 * Created by thomasjeanneau on 09/04/2017.
 */

import _ from 'lodash'
import Promise from 'bluebird'
import asyncForEach from 'async-foreach'

import {
  checkIfAdmin,
  getMember,
  getAllApplicants,
  getAllNoApplicants,
  updateApplicant,
  getApplicant,
  getSlackUser,
  checkIfFirstTime
} from '../methods'
import { pairAllApplicants } from './pairing'
import { controller } from './config'

import pairingConversation from './pairingConversation'
import startAPairingSession from './startAPairingSession'
import firstTimeConversation from './firstTimeConversation'

require('dotenv').config()

const {forEach} = asyncForEach
const {NODE_ENV} = process.env

if (!NODE_ENV) {
  console.log('Error: Specify in a .env file')
  process.exit(1)
}

// Admin Commands

controller.hears('^pair all applicants$', ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    if (await checkIfFirstTime(bot, message) === false) return
    const isAdmin = await checkIfAdmin(bot, message)
    if (isAdmin) {
      const botReply = Promise.promisify(bot.reply)
      await botReply(message, 'Ok, I\'ll start pairing people')
      const pairing = await pairAllApplicants()
      await botReply(message, `Pairing done, saved to Airtable.\n It contains ${pairing.pairs.length} pairs.`)
    } else {
      bot.reply(message, 'Sorry but it looks like you\'re not an admin. You can\'t use this feature.')
    }
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
})

controller.hears('^introduce new pairings$', ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    if (await checkIfFirstTime(bot, message) === false) return
    const isAdmin = await checkIfAdmin(bot, message)
    if (isAdmin) {
      const botReply = Promise.promisify(bot.reply)
      await botReply(message, 'Ok, I\'ll start introducing people :sparkles: ')
      const membersPaired = await startAPairingSession(bot, message)
      await pairingConversation(bot, message, membersPaired)
      await botReply(message, 'All people have been introduced :rocket:')
    } else {
      bot.reply(message, 'Sorry but it looks like you\'re not an admin. You can\'t use this feature.')
    }
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
})

controller.hears('^send presentation message to no-applicants$', ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    if (await checkIfFirstTime(bot, message) === false) return
    const isAdmin = await checkIfAdmin(bot, message)
    if (isAdmin) {
      const botReply = Promise.promisify(bot.reply)
      await botReply(message, 'Okay, I send a message to all people who are not applicants yet!')
      const noApplicants = await getAllNoApplicants(bot)
      forEach(noApplicants, async function ({id, name}) {
        const done = this.async()
        if (NODE_ENV === 'PRODUCTION') {
          firstTimeConversation(bot, {user: id}, {name})
        } else {
          console.log('Send to', name)
        }
        done()
      })
      await botReply(message, 'All done! :rocket:')
    } else {
      bot.reply(message, 'Sorry but it looks like you\'re not an admin. You can\'t use this feature.')
    }
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
})

// Applicants Commands

controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    if (await checkIfFirstTime(bot, message) === false) return
    const {name} = await getSlackUser(bot, message.user)
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      convo.say(`Hey ${name}!`)
      convo.say(`I'm your new learning buddy 🐹 I will pair you every month with Mangrove people that wish to learn from your skills and people from whom you will learn new skills 💪`)
      convo.say(`If you ever want to stop being paired, which would be very sad 😥, just tell me \`stop\``)
    })
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
})

controller.hears('^start$', ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    if (await checkIfFirstTime(bot, message) === false) return
    bot.reply(message, 'Amaaaaaaaaaaaazing 🎉\'! I\'ll let you know when the next session starts! Happy Learning!')
    const {name} = await getSlackUser(bot, message.user)
    await updateApplicant(name, {'Inactive': false})
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
})

controller.hears('^stop$', ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    if (await checkIfFirstTime(bot, message) === false) return
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      convo.say('Okay 😥, sorry to see you go.')
      convo.say('You can start again by messaging me with `start`.')
    })
    const {name} = await getSlackUser(bot, message.user)
    await updateApplicant(name, {'Inactive': true})
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
})

controller.hears('^show profile$', ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    if (await checkIfFirstTime(bot, message) === false) return
    const {name} = await getSlackUser(bot, message.user)
    const rec = await getApplicant(name)
    const {fields} = await getMember(rec.get('Applicant')[0])
    const isInactive = rec.get('Inactive') === true
    bot.reply(message, {
      'text': `:sparkles: This is your profile <@${message.user}|${name}> :sparkles:`,
      'attachments': [
        {
          'title': isInactive ? ':sleeping: Inactive' : ':hand: Active',
          'text': isInactive ? 'You\'re not gonna be paired with another P2PL applicants' : 'I can pair you with another P2PL applicants',
          'color': isInactive ? '#E0E0E0' : '#81C784',
          'thumb_url': fields['Profile Picture'][0].url
        },
        {
          'title': ':sleuth_or_spy: Interests',
          'text': rec.get('Interests').join(', '),
          'color': '#64B5F6'
        },
        {
          'title': ':muscle: Skills',
          'text': rec.get('Skills').join(', '),
          'color': '#E57373'
        }
      ]
    })
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
})

controller.hears('^show all applicants$', ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    if (await checkIfFirstTime(bot, message) === false) return
    const botReply = Promise.promisify(bot.reply)
    const apiUser = Promise.promisifyAll(bot.api.users)
    await botReply(message, `Okay, don't move, I'm searching everybody :sleuth_or_spy:`)
    const people = await getAllApplicants()
    const {members} = await apiUser.listAsync({token: bot.config.bot.app_token})
    const attachments = []
    forEach(people, async function (person) {
      const done = this.async()
      const {fields} = await getMember(person.applicant)
      const {id} = _.find(members, (m) => m.name === person.name)
      attachments.push({
        'title': `:sparkles: <@${id}|${person.name}> :sparkles:`,
        'color': '#E57373',
        'thumb_url': fields['Profile Picture'][0].url,
        'fields': [
          {
            'title': ':sleuth_or_spy: Interests',
            'value': person.interests.join(', '),
            'short': false
          },
          {
            'title': ':muscle: Skills',
            'value': person.skills.join(', '),
            'short': false
          }
        ]
      })
      done()
    }, async () => {
      await botReply(message, {
        'text': `There are currently *${people.length} P2PL applicants* :dancers:`
      })
      forEach(attachments, async function (attachment) {
        const done = this.async()
        await botReply(message, {
          'attachments': [attachment]
        })
        done()
      })
    })
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
})

controller.hears(['^help$', '^options$'], ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    if (await checkIfFirstTime(bot, message) === false) return
    const {name} = await getSlackUser(bot, message.user)
    const botReply = Promise.promisify(bot.reply)
    await botReply(message, `Hi ${name}! What can I do for you ? :slightly_smiling_face:`)
    await botReply(message, {
      attachments: [{
        pretext: 'This is what you can ask me:',
        text: `\`start\` - start being paired\n\`stop\` - stop being paired\n\`show profile\` - your P2PL applicant profile\n\`show all applicants\` - list of all P2PL applicants`,
        mrkdwn_in: ['text', 'pretext']
      }]
    })
    const isAdmin = await checkIfAdmin(bot, message)
    if (isAdmin) {
      await botReply(message, {
        attachments: [{
          pretext: 'And because you\'re an Admin, you can also do:',
          text: `\`pair all applicants\` - run the pairing algorithm and fill the <https://airtable.com/tbldvVUdJC0ScZdMe/viw7hEm5LC0qXVpqR|Pairings Table>\n\`introduce new pairings\` - send a message to all applicants about their new pairings\n\`send presentation message to no-applicants\` - I introduce myself to people who are not applicants yet`,
          mrkdwn_in: ['text', 'pretext']
        }]
      })
    }
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
})

controller.hears('[^\n]+', ['direct_message', 'direct_mention'], async (bot, message) => {
  try {
    if (await checkIfFirstTime(bot, message) === false) return
    const {name} = await getSlackUser(bot, message.user)
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      convo.say(`Sorry ${name}, but I'm too young to understand what you mean :flushed:`)
      convo.say(`If you need help, just tell me \`help\` :wink:`)
    })
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
})
