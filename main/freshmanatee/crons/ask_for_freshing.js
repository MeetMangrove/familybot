import _ from 'lodash'
import cron from 'cron'
import moment from 'moment'

import freshProfile from '../methods/convo/fresh_profile'
import { bots, log, isProd } from '../config'
import Slack from '../../api/slack'

const askForFreshing = new cron.CronJob({
  cronTime: '00 00 09 * * 1',
  onTick: async function () {
    try {
      const members = await Slack.all(bots[0])
      const weekNb = moment().format('ww')
      const chunk = _.chunk(members, members.length / 2)
      let list
      if (weekNb % 2 === 1) {
        list = chunk[0]
      } else {
        list = chunk[1]
      }
      _.forEach(list, ({ id: slackId }) => {
        if (isProd === true) {
          bots[0].startPrivateConversation({ user: slackId }, (err, convo) => {
            if (err) log('the `fresh` conversation', err)
            convo.say(`Hi <@${slackId}>!`)
            convo.say(`I'd like to know if you have some fresh news for me :blush:`)
            convo.on('end', () => freshProfile(bots[0], { user: slackId }))
          })
        } else {
          console.log('send message to', slackId)
        }
      })
    } catch (e) {
      log('the askForFreshing cron', e)
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

askForFreshing.start()
