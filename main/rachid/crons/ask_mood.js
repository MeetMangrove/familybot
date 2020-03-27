/**
 * Created by thomasjeanneau on 16/07/2017.
 */

import _ from 'lodash'
import cron from 'cron'

import { bots, log } from '../config'
import Slack from '../../api/slack'
import giveMood from '../methods/convo/give_mood'

export default async function () {
  try {
    const members = await Slack.all(bots[0])
    _.forEach(members, ({ id: slackId }) => {
      const random = Math.floor(Math.random() * Math.floor(3))
      if (random === 1) {
        giveMood(bots[0], { user: slackId })
      }
    })
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
