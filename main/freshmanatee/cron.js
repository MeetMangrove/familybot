/**
 * Created by thomasjeanneau on 10/06/2017.
 */

import _ from 'lodash'
import cron from 'cron'
import moment from 'moment'

import { bots } from './config'
import askForUpdate from './askForUpdate'
import { getAllMembers } from '../methods'

const { CronJob } = cron

const sendMessage = new CronJob({
  cronTime: '* * 09 * * 1',
  onTick: function () {
    _.forEach(bots, async (bot) => {
      const members = await getAllMembers(bot)
      const weekNb = moment().format('ww')
      const chunk = _.chunk(members, members.length / 2)
      let list
      if (weekNb % 2 === 1) {
        list = chunk[0]
      } else {
        list = chunk[1]
      }
      _.forEach(list, async (params) => await askForUpdate({bot, ...params}))
    })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

sendMessage.start()
