/**
 * Created by thomasjeanneau on 16/07/2017.
 */

import _ from 'lodash'
import cron from 'cron'

import { bots, log } from '../config'
import Slack from '../../api/slack'
import giveMood from '../methods/convo/give_mood'

const askMood = new cron.CronJob({
  cronTime: '00 00 15 * * 1-5',
  onTick: async function () {
    try {
      const members = await Slack.all(bots[0])
      _.forEach(members, ({ id: slackId }) => {
        const random = Math.floor(Math.random() * Math.floor(3))
        if (random === 1) {
          giveMood(bots[0], { user: slackId })
        }
      })
    } catch (e) {
      log('the `ask_mood` cron', e)
    }
  },
  start: false,
  timeZone: 'Europe/Paris'
})

askMood.start()
