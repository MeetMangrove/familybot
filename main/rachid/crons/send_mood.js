import cron from 'cron'

import getMood from '../methods/convo/get_mood'
import { bots } from '../config'

require('dotenv').config()

const channelName = process.env.MOOD_CHANNEL_NAME

const sendMood = new cron.CronJob({
  cronTime: '00 00 19 * * *',
  onTick: async function () {
    await getMood(bots[0], { channel: `#${channelName}` })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

sendMood.start()
