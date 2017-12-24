import cron from 'cron'
import moment from 'moment'
import Promise from 'bluebird'
import { Base64 } from 'js-base64'
import MailComposer from 'nodemailer/lib/mail-composer'

import gmail from '../../api/gmail'
import { bots, log, isProd } from '../config'
import { getEmails, getNewsletter } from '../methods'

const sendNewsletter = new cron.CronJob({
  cronTime: '00 00 14 * * 4',
  onTick: async function () {
    try {
      const date = moment().format('DD/MM/YYYY')
      const emails = await getEmails('Veteran')
      const newsletter = await getNewsletter(date)
      const sendMessage = Promise.promisify(bots[0].say)
      const sendEmail = Promise.promisify(gmail.users.messages.send)
      const mail = new MailComposer({
        from: '"Fresh Manatee 🎉" <hello@mangrove.io>',
        to: emails,
        subject: newsletter.get('Title'),
        text: newsletter.get('Content')
      })
      mail.compile().build(async (err, message) => {
        if (err) return log('the MailComposer function', err)
        const raw = Base64.encodeURI(message)
        await sendEmail({
          userId: 'me',
          resource: { raw }
        })
        await sendMessage({
          text: `The newsletter has been sent to *${emails.length} Veterans* from hello@mangrove.io :airplane_departure:`,
          channel: isProd ? '#track-connectors' : '#ghost-playground'
        })
      })
    } catch (e) {
      log('the sendNewsletter cron', e)
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

sendNewsletter.start()
