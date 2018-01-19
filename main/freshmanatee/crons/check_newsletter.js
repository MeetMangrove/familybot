import cron from 'cron'
import Promise from 'bluebird'

import { createNewsletter, getUpdates } from '../methods'
import { bots, log, isProd } from '../config'

const checkNewsletter = new cron.CronJob({
  cronTime: '00 00 14 * * 3',
  onTick: async function () {
    try {
      const members = await getUpdates()
      const sendMessage = Promise.promisify(bots[0].say)

      // Connector Newsletter
      const { text, id } = await createNewsletter(members)
      await sendMessage({
        text: `Hi <!subteam^S7W60V3L6>!\nHere is the content of the Veteran Newsletter to be sent :love_letter:`,
        attachments: [{
          title: 'Draft Veteran Newsletter',
          text: `\`\`\`${text}\`\`\``,
          mrkdwn_in: ['text']
        }],
        channel: isProd ? '#track-connectors' : '#ghost-playground'
      })
      await sendMessage({
        text: `If you want to change it, <https://airtable.com/tblBsCEc45GtppbBP/viwIUnStSvSIhxqhv/${id}|click here to update the content field>.\n` +
        'It will be automatically sent tomorrow at 2PM Paris time!\n' +
        ':information_source: Good update includes :\n' +
        '- Correcting typos\n' +
        '- Removing private stuff\n' +
        '- Adding infos about next event',
        channel: isProd ? '#track-connectors' : '#ghost-playground'
      })
    } catch (e) {
      log('the checkNewsletter cron', e)
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

checkNewsletter.start()
