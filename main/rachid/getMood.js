import moment from 'moment-timezone'

import {
  getMoods,
  getEmoji,
  getColor
} from './methods'
import { getMember } from '../airtable'

export default async ({ bot, channel, slackId }) => {
  const moods = await getMoods()
  const attachments = []
  if (moods.length >= 1) {
    for (let mood of moods) {
      const { fields: user } = await getMember(mood['Member'][0])
      attachments.push({
        'title': `${getEmoji(mood['Level'])} <@${user['Slack ID']}> is at ${mood['Level']}/5`,
        'text': mood['Comment'],
        'color': getColor(mood['Level']),
        'thumb_url': user['Profile Picture'][0].url,
        'footer': moment(mood['Date']).tz('Europe/Paris').format('MMM Do [at] h:mm A')
      })
    }
    bot.say({
      text: `Hi ${!slackId ? 'dream team' : `<@${slackId}>`}! Here is the mood daily digest :sparkles:`,
      channel,
      attachments
    }, (err) => {
      if (err) console.log(err)
    })
  } else if (slackId) {
    bot.say({ text: `Sorry <@${slackId}>, there is no mood today :stuck_out_tongue:`, channel })
  }
}
