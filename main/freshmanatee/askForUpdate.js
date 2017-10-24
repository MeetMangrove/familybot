/**
 * Created by thomasjeanneau on 30/05/2017.
 */

import { getIdFromName, getMember } from '../methods'

export default async ({ bot, name, id }) => {
  try {
    bot.say({
      text: `Hey ${name}, I'm searching your profile :sleuth_or_spy:`,
      channel: id
    }, async (err, res) => {
      if (err) console.log(res)
      const airtableId = await getIdFromName(name)
      const profile = await getMember(airtableId)
      bot.api.chat.update({
        token: bot.config.bot.token,
        as_user: true,
        text: `Okay, so this is your current information:`,
        attachments: [
          {
            'title': ':closed_book: Public bio',
            'text': profile.get('Public bio'),
            'color': '#E57373'
          },
          {
            'title': ':house_with_garden: Location',
            'text': profile.get('Current location'),
            'color': '#81C784'
          },
          {
            'title': ':rocket: Focus',
            'text': profile.get('Focus'),
            'color': '#64B5F6'
          },
          {
            'title': ':tornado: Challenges',
            'text': profile.get('Challenges'),
            'color': '#E0E0E0'
          },
          {
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
          }
        ],
        channel: res.channel,
        ts: res.ts
      }, (err) => {
        if(err) console.log(err)
      })
    })
  } catch (e) {
    console.log(e)
    bot.reply({ user: id }, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
}
