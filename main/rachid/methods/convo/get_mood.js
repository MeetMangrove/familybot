import Promise from 'bluebird'
import moment from 'moment-timezone'

import {
  getMoods,
  getEmoji,
  getColor
} from '../index'
import { getMember } from '../../../api/airtable'
import { log } from '../../config'

export default async (bot, message) => {
  try {
    const moods = await getMoods()
    const sendMessage = Promise.promisify(bot.say)
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
      await sendMessage({
        text: `Here is the mood digest of the day :sparkles:`,
        channel: message.user || message.channel,
        attachments
      })
    } else if (message.user) {
      await sendMessage({
        text: `Sorry <@${message.user}>, there is no mood today :stuck_out_tongue:`,
        channel: message.user
      })
    }
  } catch (e) {
    log('the `get_mood` conversation', e)
  }
}
