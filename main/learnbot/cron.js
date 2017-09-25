import cron from 'cron'

import { pairAllApplicants } from './pairing'
import pairingConversation from './pairingConversation'
import startAPairingSession from './startAPairingSession'

const {CronJob} = cron

const pairing = new CronJob({
  cronTime: '00 00 09 01 * *',
  onTick: async function () {
    await pairAllApplicants()
    const membersPaired = await startAPairingSession(bot, message)
    await pairingConversation(bot, message, membersPaired)
  },
  start: false,
  timeZone: 'Europe/Paris'
})

pairing.start()