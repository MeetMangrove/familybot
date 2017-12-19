/**
 * Created by thomasjeanneau on 30/05/2017.
 */

import _ from 'lodash'

import { getMember } from '../airtable'

export default ({ bot, convo, slackId }) => {
  const timeout = setTimeout((bot, channel, convo) => {
    bot.say({ text: 'Hum... you seem busy. Come back say `fresh` when you want!', channel })
    convo.stop()
  }, 1800000, bot, slackId, convo)

  convo.addMessage({
    text: 'I\'m searching your profile :sleuth_or_spy:',
    action: 'search'
  }, 'default')

  convo.beforeThread('search', async (convo, next) => {
    const profile = await getMember(slackId)
    const skills = profile.get('Skills')
    const learning = profile.get('Learning')
    convo.setVar('profile', {
      bio: profile.get('Bio'),
      location: profile.get('Location'),
      focus: profile.get('Focus'),
      challenges: profile.get('Challenges'),
      textSkills: skills && skills.length > 0 ? skills.join(', ') : '',
      textInterests: learning && learning.length > 0 ? learning.join(', ') : '',
      interests: _.map(profile.get('Learning'), i => ({ label: i, value: i }))
    })
    next()
  })

  convo.addMessage({
    text: `Okay, so this is your current information:`,
    attachments: [
      {
        'title': ':house_with_garden: Location',
        'text': '{{{vars.profile.location}}}',
        'color': '#81C784'
      },
      {
        'title': ':closed_book: Bio',
        'text': '{{{vars.profile.bio}}}',
        'color': '#FFD180'
      },
      {
        'title': ':rocket: Focus',
        'text': '{{{vars.profile.focus}}}',
        'color': '#B388FF'
      },
      {
        'title': ':tornado: Challenges',
        'text': '{{{vars.profile.challenges}}}',
        'color': '#E0E0E0'
      }
      /* {
        'title': ':muscle: Skills',
        'text': '{{{vars.profile.textSkills}}}',
        'color': '#64B5F6'
      },
      {
        'title': ':sleuth_or_spy: Interests',
        'text': '{{{vars.profile.textInterests}}}',
        'color': '#E57373'
      } */
    ]
  }, 'search')

  convo.addQuestion({
    attachments: [{
      title: 'Do you want to update these information?',
      callback_id: 'update_info',
      attachment_type: 'default',
      actions: [
        {
          'name': 'yes',
          'text': 'Yes',
          'value': 'yes',
          'type': 'button',
          'style': 'primary'
        },
        {
          'name': 'no',
          'text': 'No',
          'value': 'no',
          'type': 'button'
        }
      ]
    }]
  }, function (reply, convo) {
    if (reply.callback_id === 'update_info') {
      clearTimeout(timeout)
      if (reply.actions[0].value === 'yes') {
        const dialog = bot
          .createDialog(
            'Fresh your profile',
            'fresh_profile',
            'Fresh')
          .addText('Update your location', 'Location', convo.vars.profile.location, {
            placeholder: 'What is your current location (City, Country)?'
          })
          .addTextarea('Edit your bio', 'Bio', convo.vars.profile.bio, {
            max_length: 500,
            placeholder: 'What are your current projects? What made you happy recently (outside of projects)?'
          })
          .addTextarea('Share your focus', 'Focus', convo.vars.profile.focus, {
            max_length: 300,
            placeholder: 'Your main focus for the next two weeks?'
          })
          .addTextarea('Share your challenges', 'Challenges', convo.vars.profile.challenges, {
            max_length: 300,
            placeholder: 'What challenges do you currently face in your projects and life?',
            hint: '@catalyst team are here to help you to resolve them. Try to write actionable challenges for a better mutual help.'
          })
        bot.replyWithDialog(reply, dialog.asObject(), function (err, res) {
          console.log(err, res)
          if (err) throw new Error(err)
          bot.replyInteractive(reply, {
            attachments: [{
              title: 'Do you want to update these information?',
              text: 'Okay, let\'s fresh your profile! :facepunch:',
              callback_id: 'update_info',
              attachment_type: 'default'
            }]
          })
          convo.next()
        })
      } else {
        bot.replyInteractive(reply, {
          attachments: [
            {
              title: 'Do you want to update these information?',
              text: 'Okay, see you! :wave:',
              callback_id: 'update_info',
              attachment_type: 'default'
            }
          ]
        })
        convo.next()
      }
    }
  }, {}, 'search')
  convo.activate()
}
