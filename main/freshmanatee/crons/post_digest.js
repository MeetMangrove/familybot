import cron from 'cron'
import Promise from 'bluebird'

import { cleanUpdates, createNewsletter, getUpdates } from '../methods'
import { bots, log, isProd } from '../config'

const postDigest = new cron.CronJob({
  cronTime: '00 00 18 * * 3',
  onTick: async function () {
    try {
      const members = await getUpdates()
      const sendMessage = Promise.promisify(bots[0].say)
      const attachments = []
      members.forEach((member) => {
        const { slackId, location, focus, challenges } = member
        attachments.push({
          title: `<@${slackId}>`,
          text: `${location ? `:house_with_garden: just moved to *${location}*\n` : ''}${focus ? `:rocket: has a new focus: \`\`\`${focus}\`\`\`\n` : ''}${challenges ? `:tornado: is currently dealing with the following challenge(s): \`\`\`${challenges}\`\`\`` : ''}`,
          mrkdwn_in: ['text']
        })
      })

      // General Message
      await sendMessage({
        text: `:heart:️ *Members updates* :heart:️\nThis is what changed in the lives of fellow Mangrovers:`,
        attachments,
        channel: isProd ? '#general' : '#ghost-playground'
      })
      await sendMessage({
        text: `Go Mangrove :facepunch:`,
        channel: isProd ? '#general' : '#ghost-playground'
      })
      cleanUpdates(members)

      // Catalyst Challenges
      await sendMessage({
        text: `Hi <!subteam^S7WBYB6TZ>!\nHere is the currents Mangrovers' challenges :tornado:`,
        channel: isProd ? '#track-catalysts' : '#ghost-playground'
      })
      for (let member of members) {
        const { slackId, challenges } = member
        if (challenges !== null) {
          await sendMessage({
            text: `<@${slackId}> is currently dealing with the following challenge(s): \`\`\`${challenges}\`\`\``,
            channel: isProd ? '#track-catalysts' : '#ghost-playground'
          })
        }
      }

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
        'It will be automatically sent tomorrow at 2PM!\n' +
        ':information_source: Good update includes :\n' +
        '- Correcting typos\n' +
        '- Removing private stuff\n' +
        '- Adding infos about next event',
        channel: isProd ? '#track-connectors' : '#ghost-playground'
      })
    } catch (e) {
      log('the postDigest cron', e)
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

postDigest.start()
