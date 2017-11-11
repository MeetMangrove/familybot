/* import cron from 'cron'

import { pairAllApplicants } from './pairing'
import pairingConversation from './pairingConversation'
import startAPairingSession from './startAPairingSession'
import askIfMeeting from './askIfMeeting'

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

const firstAsk = new CronJob({
  cronTime: '00 00 09 08 * *',
  onTick: async function () {
    bot.startConversation(message, function (err, convo) {
      if (err) return console.log(err)
      convo.say(`Hi guys, it has been a week since I have paired you.`)
      askIfMeeting(convo)
    })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

const secondAsk = new CronJob({
  cronTime: '00 00 09 15 * *',
  onTick: async function () {

  },
  start: false,
  timeZone: 'Europe/Paris'
})

const thirdAsk = new CronJob({
  cronTime: '00 00 09 29 * *',
  onTick: async function () {

  },
  start: false,
  timeZone: 'Europe/Paris'
})

pairing.start()
firstAsk.start()
secondAsk.start()
thirdAsk.start() */
