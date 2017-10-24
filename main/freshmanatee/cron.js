/**
 * Created by thomasjeanneau on 10/06/2017.
 */

import _ from 'lodash'
import cron from 'cron'
import Promise from 'bluebird'

import { bots } from './config'
import { getResponsibles, updateMember } from '../methods'

const {CronJob} = cron

const job = new CronJob({
  cronTime: '00 00 09 * * 1',
  onTick: function () {
    _.forEach(bots, async (bot) => {
      try {
        const {responsibleId, nextResponsibleId, airtableId, nextAirtableId} = await getResponsibles(bot)
        const apiChat = Promise.promisifyAll(bot.api.chat)
        await apiChat.postMessageAsync({
          token: bot.config.bot.token,
          channel: responsibleId,
          text: `Hey <@${responsibleId}> ! It's the turn of <@${nextResponsibleId}> to take responsability for the weeklynews\n Don't forget to warn <@${nextResponsibleId}> :wink:`,
          as_user: false
        })
        await updateMember(airtableId, {
          'Is responsible ? [weeklynews]': false
        })
        await updateMember(nextAirtableId, {
          'Is responsible ? [weeklynews]': true
        })
      } catch (e) {
        console.log(e)
      }
    })
  },
  start: false,
  timeZone: 'Europe/Paris'
})

job.start()
