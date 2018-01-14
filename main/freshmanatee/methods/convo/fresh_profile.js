/**
 * Created by thomasjeanneau on 30/05/2017.
 */

import _ from 'lodash'

import freshLearning from './fresh_learning'
import controller, { log } from '../../config'
import { getMemberWithSkills, getSkillsList, saveProfile, sort } from '../index'
import moment from 'moment'

export default (bot, message) => bot.createPrivateConversation(message, (err, convo) => {
  if (err) log('the `fresh_profile` conversation', err)

  convo.setTimeout(1500000)

  convo.addMessage({
    text: 'I\'m searching your profile :sleuth_or_spy:',
    action: 'search'
  }, 'default')

  convo.beforeThread('search', (convo, next) => {
    getMemberWithSkills(message.user)
      .then((profile) => {
        const currentSkills = _.map(profile.get('Skills'), ({ text }) => text)
        currentSkills.sort(sort)
        convo.setVar('bio', profile.get('Bio'))
        convo.setVar('location', profile.get('Location'))
        convo.setVar('focus', profile.get('Focus'))
        convo.setVar('challenges', profile.get('Challenges'))
        convo.setVar('currentSkills', currentSkills && currentSkills.length > 0 ? currentSkills.join(', ') : 'No one')
        next()
      })
      .catch((err) => {
        log('the `getMember` method', err)
        convo.stop()
        next('stop')
      })
  })

  const monthNb = moment().format('MM')
  const dayNb = moment().format('DD')
  const attachments = [
    {
      'title': ':house_with_garden: Location',
      'text': '{{#vars.location}}{{{vars.location}}}{{/vars.location}}{{^vars.location}}None{{/vars.location}}',
      'color': '#8BC34A'
    },
    {
      'title': ':rocket: Focus',
      'text': '{{#vars.focus}}{{{vars.focus}}}{{/vars.focus}}{{^vars.focus}}None{{/vars.focus}}',
      'color': '#CDDC39'
    },
    {
      'title': ':tornado: Challenges',
      'text': '{{#vars.challenges}}{{{vars.challenges}}}{{/vars.challenges}}{{^vars.challenges}}None{{/vars.challenges}}',
      'color': '#F44336'
    }
  ]

  if (monthNb % 2 === 1 && dayNb <= 14) {
    attachments.unshift({
      'title': ':writing_hand: Bio',
      'text': '{{#vars.bio}}{{{vars.bio}}}{{/vars.bio}}{{^vars.bio}}None{{/vars.bio}}',
      'color': '#FFEB3B'
    }, {
      'title': ':muscle: Skills',
      'text': '{{#vars.currentSkills}}{{{vars.currentSkills}}}{{/vars.currentSkills}}{{^vars.currentSkills}}No one{{/vars.currentSkills}}',
      'color': '#FF9800'
    })
  }

  convo.addMessage({
    text: `Okay, so this is your current information:`,
    attachments
  }, 'search')

  convo.addQuestion({
    attachments: [{
      title: 'Do you want to update these information?',
      callback_id: 'update_info',
      attachment_type: 'default',
      actions: [
        {
          name: 'yes',
          text: 'Yes',
          value: 'Yes',
          type: 'button',
          style: 'primary'
        },
        {
          name: 'no',
          text: 'No',
          value: 'No',
          type: 'button'
        }
      ]
    }]
  }, function (reply, convo) {
    if (reply.callback_id === 'update_info') {
      bot.replyInteractive(reply, {
        attachments: [{
          title: 'Do you want to update these information?',
          text: `_${reply.actions[0].value}_`,
          mrkdwn_in: ['text']
        }]
      })
      if (reply.actions[0].name === 'yes') {
        const dialog = bot
          .createDialog(
            'Fresh your profile',
            'fresh_profile',
            'Fresh')
          .addText('Update your location', 'Location', convo.vars.location, {
            placeholder: 'What is your current location (City, Country)?'
          })
          .addTextarea('Share your focus', 'Focus', convo.vars.focus, {
            max_length: 300,
            placeholder: 'What is your main focus for the next two weeks?'
          })
          .addTextarea('Share your challenges', 'Challenges', convo.vars.challenges, {
            max_length: 300,
            optional: true,
            placeholder: 'What challenges do you currently face in your projects and life?',
            hint: '@catalyst team are here to help you to resolve them. Try to write actionable challenges for a better mutual help.'
          })
          .addTextarea('Edit your bio', 'Bio', convo.vars.bio, {
            max_length: 500,
            placeholder: 'What are your current projects? What made you happy recently (outside of projects)?'
          })
        bot.replyWithDialog(reply, dialog.asObject(), function (err) {
          if (err) {
            const text = log('the dialog creation', err)
            convo.say(text)
          }
        })
      } else {
        convo.say('I\'m looking for your learning right now!')
        freshLearning(bot, message)
      }
    }
    convo.next()
  }, {}, 'search')

  convo.addMessage('Hum... you seem busy. Come back say `fresh` when you want!', 'on_timeout')

  convo.activate()
})

controller.on('dialog_submission', function (bot, message) {
  bot.dialogOk()
  console.log(message.submission)
  saveProfile(message.user, message.submission)
    .then(({ isUpdated, learningRemoved, newSkill }) => bot.startPrivateConversation(message, (err, convo) => {
      if (err) return log('the `dialog_submission` conversation', err)
      if (isUpdated === true) convo.say(`Your profile has been freshed!`)
      if (learningRemoved === true) {
        convo.say(`Congratulation!! :tada: Your learning *${newSkill}* is finally become a new skill! :clap::clap::clap:`)
        convo.say(`Don't forget to celebrate that! :cocktail:`)
      }
      convo.say(`I'm looking for your learning right now!`)
      convo.on('end', () => freshLearning(bot, message))
    }))
    .catch(err => log('the `saveProfile` method', err))
})
