/**
 * Created by thomasjeanneau on 30/05/2017.
 */

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
    convo.setVar('profile', {
      bio: profile.get('Bio'),
      location: profile.get('Location'),
      focus: profile.get('Focus'),
      challenges: profile.get('Challenges'),
      skills: profile.get('Skills'),
      interests: profile.get('Interests')
    })
    next()
  })

  convo.addMessage({
    text: `Okay, so this is your current information:`,
    attachments: [
      {
        'title': ':closed_book: Bio',
        'text': '{{{vars.profile.bio}}}',
        'color': '#FFD180'
      },
      {
        'title': ':house_with_garden: Location',
        'text': '{{{vars.profile.location}}}',
        'color': '#81C784'
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
      }/* ,
      {
        'title': ':muscle: Skills',
        'text': '{{{vars.profile.skills}}}',
        'color': '#64B5F6'
      },
      {
        'title': ':sleuth_or_spy: Interests',
        'text': '{{{vars.profile.interests}}}',
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
          .addTextarea('Bio', 'Bio', convo.vars.profile.bio, {
            max_length: 500,
            placeholder: 'What are your current projects? What made you happy recently (outside of projects)?'
          })
          .addText('Location', 'Location', convo.vars.profile.location, {
            placeholder: 'What is your current location (City, Country)?'
          })
          .addTextarea('Focus', 'Focus', convo.vars.profile.focus, {
            max_length: 300,
            placeholder: 'Your main focus for the next two weeks? (private)'
          })
          .addTextarea('Challenges', 'Challenges', convo.vars.profile.challenges, {
            max_length: 300,
            placeholder: 'What challenges do you currently face in your projects and life? (private)',
            hint: '@catalyst team are here to help you to resolve them. Try to write actionable challenges for a better mutual help.'
          })
          /* .addTextarea('Skills', 'Skills', convo.vars.profile.skills, {
            max_length: 300,
            placeholder: 'What are your skills? In which domains are you good at? (private)',
            hint: 'List each skills with a `,` as separator.'
          })
          .addTextarea('Interests', 'Interests', convo.vars.profile.interests, {
            max_length: 300,
            placeholder: 'What new skills are you looking for? What do you want to learn? (private)',
            hint: 'List each interests with a `,` as separator.'
          }) */
        bot.replyWithDialog(reply, dialog.asObject(), (err) => {
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
