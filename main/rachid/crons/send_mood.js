import cron from 'cron'

import getMood from '../methods/convo/get_mood'
import { bots } from '../config'

const sendMood = new cron.CronJob({
  cronTime: '00 00 19 * * *',
  onTick: async function () {
    await getMood(bots[0], { channel: '#moods' })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

sendMood.start()
