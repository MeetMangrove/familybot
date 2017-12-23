import cron from 'cron'
import moment from 'moment'
import Promise from 'bluebird'

import { bots, log, isProd } from '../config'
import { getEmails, getNewsletter } from '../methods'
import Nodemailer from '../../api/nodemailer'

const sendNewsletter = new cron.CronJob({
  cronTime: '00 00 14 * * 4',
  onTick: async function () {
    try {
      const date = moment().format('DD/MM/YYYY')
      const emails = await getEmails('Veteran')
      const newsletter = await getNewsletter(date)
      const sendMessage = Promise.promisify(bots[0].say)
      const sendMail = Promise.promisify(Nodemailer.sendMail)
      const data = {
        from: '"Fresh Manatee 🎉" <hellomangrove@gmail.com>',
        to: emails,
        subject: newsletter.get('Title'),
        text: newsletter.get('Content')
      }
      await sendMail(data)
      await sendMessage({
        text: `The newsletter has been sent to *${emails.length} Veterans* from hellomangrove@gmail.com :airplane_departure:`,
        channel: isProd ? '#track-connectors' : '#ghost-playground'
      })
    } catch (e) {
      log('the sendNewsletter cron', e)
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

sendNewsletter.start()
