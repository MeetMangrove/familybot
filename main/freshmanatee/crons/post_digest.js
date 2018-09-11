import cron from 'cron'
import Promise from 'bluebird'

import { cleanUpdates, createNewsletter, getUpdates, getLearningPeople, getTeachingPeople } from '../methods'
import { bots, log, isProd } from '../config'

const postDigest = new cron.CronJob({
  cronTime: '00 00 18 * * 3',
  onTick: async function () {
    try {
      const members = await getUpdates()
      const sendMessage = Promise.promisify(bots[0].say)
      const attachments = []
      for (let member of members) {
        const { slackId, location, focus, challenges, skill, learning } = member
        let text = ''
        if (location) text = text.concat(`:house_with_garden: just moved to *${location}*`)
        if (focus) text = text.concat(`\n:rocket: has a new focus: \`\`\`${focus}\`\`\``)
        if (challenges) text = text.concat(`\n:tornado: is dealing with the following challenge(s): \`\`\`${challenges}\`\`\``)
        if (skill) {
          text = text.concat(`\n:muscle: learned a new skill: *${skill}*, congratulation :tada:`)
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
            text = text.concat(textLearningPeople, ' who are currently learning it!_')
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
            text = text.concat(textTeachingPeople, ` maybe you can help <@${slackId}> learn this skill?_ :pray:`)
          }
        }
        attachments.push({ title: `<@${slackId}>`, text, mrkdwn_in: ['text'] })
      }

      // General Message
      if (attachments.length > 0) {
        await sendMessage({
          text: `:heart:️ *Members updates* :heart:️\nThis is what changed in the lives of fellow Mangrovers:`,
          attachments,
          channel: isProd ? '#general' : '#ghost-playground'
        })
        await sendMessage({
          text: `Go Mangrove :facepunch:`,
          channel: isProd ? '#general' : '#ghost-playground'
        })
      }

      if (isProd === true) cleanUpdates(members)

      // Catalyst Challenges
      /*
      await sendMessage({
        text: `Hi <!subteam^S7WBYB6TZ>!\nCurrent Mangrovers' challenges :tornado:`,
        channel: isProd ? '#track-catalysts' : '#ghost-playground'
      })
      for (let member of members) {
        const { slackId, challenges } = member
        if (challenges) {
          await sendMessage({
            text: `<@${slackId}> is dealing with the following challenge(s): \`\`\`${challenges}\`\`\``,
            channel: isProd ? '#track-catalysts' : '#ghost-playground'
          })
        }
      }
      */
    } catch (e) {
      log('the postDigest cron', e)
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

postDigest.start()
