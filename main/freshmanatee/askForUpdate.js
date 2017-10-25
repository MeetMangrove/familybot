/**
 * Created by thomasjeanneau on 30/05/2017.
 */

import { getIdFromName, getMember } from '../methods'

export default ({ bot, convo, name, id }) => {
  try {
    convo.addMessage({
      text: 'I\'m searching your profile :sleuth_or_spy:',
      action: 'search'
    }, 'default')
    convo.beforeThread('search', async (convo, next) => {
      const airtableId = await getIdFromName(name)
      const profile = await getMember(airtableId)
      convo.setVar('profile',{
        bio: profile.get('Bio'),
        location: profile.get('Location'),
        focus: profile.get('Focus'),
        challenges: profile.get('Challenges'),
      })
      next()
    })
    convo.addMessage({
      text: `Okay, so this is your current information:`,
      attachments: [
        {
          'title': ':closed_book: Bio',
          'text': '{{{vars.profile.bio}}}',
          'color': '#E57373'
        },
        {
          'title': ':house_with_garden: Location',
          'text': '{{{vars.profile.location}}}',
          'color': '#81C784'
        },
        {
          'title': ':rocket: Focus',
          'text': '{{{vars.profile.focus}}}',
          'color': '#64B5F6'
        },
        {
          'title': ':tornado: Challenges',
          'text': '{{{vars.profile.challenges}}}',
          'color': '#E0E0E0'
        }]
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
    }, function (message, convo) {
      if (message.callback_id === 'update_info') {
        if (message.actions[0].value === 'yes') {
          const dialog = bot
            .createDialog(
              'Fresh your profile',
              'fresh_profile',
              'Fresh')
            .addTextarea('Bio', 'Bio', profile.get('Bio'), {
              max_length: 500,
              placeholder: 'What are your current projects? What made you happy recently (outside of projects)?'
            })
            .addText('Location', 'Location', profile.get('Location'))
            .addTextarea('Focus', 'Focus', profile.get('Focus'), {
              max_length: 300,
              placeholder: 'Your main focus for the next two weeks? (private)'
            })
            .addTextarea('Challenges', 'Challenges', profile.get('Challenges'), {
              max_length: 300,
              placeholder: 'What challenges do you currently face in your projects and life? (private)'
            })
          bot.replyWithDialog(message, dialog.asObject(), (err) => {
            if (err) console.log(err)
            convo.say({
              attachments: [{
                title: 'Do you want to update these information?',
                text: 'Okay, Let\'s fresh your profile! :wave:',
                callback_id: 'update_info',
                attachment_type: 'default',
              }]
            })
            convo.next()
          })
        } else {
          convo.say({
            attachments: [
              {
                title: 'Do you want to update these information?',
                text: 'Okay, see you in two weeks! :wave:',
                callback_id: 'update_info',
                attachment_type: 'default',
              }
            ]
          })
          convo.next()
        }
      }
    }, {}, 'search')
    convo.activate()
  } catch (e) {
    console.log(e)
    bot.reply({ user: id }, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
}
