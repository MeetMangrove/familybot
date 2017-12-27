import cron from 'cron'
import Promise from 'bluebird'

import { cleanUpdates, createNewsletter, getUpdates, getLearningPeople, getTeachingPeople } from '../methods'
import { bots, log, isProd } from '../config'

const postDigest = new cron.CronJob({
  cronTime: '00 10 20 * * 3',
  onTick: async function () {
    try {
      const members = await getUpdates()
      const sendMessage = Promise.promisify(bots[0].say)
      /* const attachments = []
      for (let member of members) {
        const { slackId, location, focus, challenges, skill, learning } = member
        let text = ''
        if (location) text = text.concat(`:house_with_garden: just moved to *${location}*`)
        if (focus) text = text.concat(`\n:rocket: has a new focus: \`\`\`${focus}\`\`\``)
        if (challenges) text = text.concat(`\n:tornado: is currently dealing with the following challenge(s): \`\`\`${challenges}\`\`\``)
        if (skill) {
          text = text.concat(`\n:muscle: has developed a new skill: *${skill}*, congratulation :tada:`)
          const learningPeople = await getLearningPeople(skill)
          if (learningPeople.length > 0) {
            let textLearningPeople = '\n_You can teach this skill to '
            learningPeople.forEach((id, index) => {
              if (index === 0) {
                textLearningPeople = textLearningPeople.concat(`<@${id}>`)
              } else if (index + 1 === learningPeople.length) {
                textLearningPeople = textLearningPeople.concat(` and <@${id}>`)
              } else {
                textLearningPeople = textLearningPeople.concat(`, <@${id}>`)
              }
            })
            text = text.concat(textLearningPeople, ' which are currently learning it!_')
          }
        }
        if (learning) {
          text = text.concat(`\n:baby: starting to learn *${learning}*`)
          const teachingPeople = await getTeachingPeople(learning)
          if (teachingPeople.length > 0) {
            let textTeachingPeople = '\n_'
            teachingPeople.forEach((id, index) => {
              if (index === 0) {
                textTeachingPeople = textTeachingPeople.concat(`<@${id}>`)
              } else if (index + 1 === teachingPeople.length) {
                textTeachingPeople = textTeachingPeople.concat(` and <@${id}>`)
              } else {
                textTeachingPeople = textTeachingPeople.concat(`, <@${id}>`)
              }
            })
            text = text.concat(textTeachingPeople, ` maybe can you help <@${slackId}> to learn this skill?_ :pray:`)
          }
        }
        attachments.push({ title: `<@${slackId}>`, text, mrkdwn_in: ['text'] })
      }

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

      if (isProd === true) cleanUpdates(members)

      // Catalyst Challenges
      await sendMessage({
        text: `Hi <!subteam^S7WBYB6TZ>!\nHere is the currents Mangrovers' challenges :tornado:`,
        channel: isProd ? '#track-catalysts' : '#ghost-playground'
      })
      for (let member of members) {
        const { slackId, challenges } = member
        if (challenges) {
          await sendMessage({
            text: `<@${slackId}> is currently dealing with the following challenge(s): \`\`\`${challenges}\`\`\``,
            channel: isProd ? '#track-catalysts' : '#ghost-playground'
          })
        }
      }  */

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
      log('the postDigest cron', e)
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

postDigest.start()
