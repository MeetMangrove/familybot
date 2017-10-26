import moment from 'moment-timezone'
import asyncForEach from 'async-foreach'

import {
  getMoods,
  getMember,
  getEmoji,
  getColor
} from '../methods'

const { forEach } = asyncForEach

export default async (bot, channel, name) => {
  try {
    const moods = await getMoods()
    const attachments = []
    if (moods.length >= 1) {
      forEach(moods, async function (mood) {
        const done = this.async()
        const { fields: user } = await getMember(mood['Member'][0])
        attachments.push({
          'title': `${getEmoji(mood['Level'])} <${user['Slack Handle']}> is at ${mood['Level']}/5`,
          'text': mood['Comment'],
          'color': getColor(mood['Level']),
          'thumb_url': user['Profile Picture'][0].url,
          'footer': moment(mood['Date']).tz('Europe/Paris').format('MMM Do [at] h:mm A')
        })
        done()
      }, () => bot.say({
        text: `Hi ${!name ? 'dream team' : name}! Here is the mood daily digest :sparkles:`,
        channel,
        attachments
      }, (err) => {
        if (err) console.log(err)
      }))
    } else if (name) {
      bot.say({ text: `Sorry ${name}, there is no mood today :stuck_out_tongue:`, channel })
    }
  } catch (e) {
    console.log(e)
    bot.say({
      text: `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``,
      channel
    })
  }
}