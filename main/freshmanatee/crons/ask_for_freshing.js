import _ from 'lodash'
import cron from 'cron'
import moment from 'moment'

import freshProfile from '../methods/convo/fresh_profile'
import freshLearning from '../methods/convo/fresh_learning'
import freshSkill from '../methods/convo/fresh_skill'
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
      _.forEach(list, ({ id: user }) => {
        if (isProd === true) {
          bots[0].createPrivateConversation({ user }, (err, convo) => {
            if (err) log('the `fresh` conversation', err)
            convo.setTimeout(1500000)
            convo.addMessage(`Hi <@${user}>!`, 'default')
            convo.addMessage({
              text: 'Any fresh news for me? :blush:',
              action: 'fresh_profile'
            }, 'default')
            freshProfile(convo, 'fresh_learning')
            freshLearning(convo, 'fresh_skills')
            freshSkill(convo)
            convo.addMessage(`Okay, see ya! :wave:`, 'exit')
            convo.addMessage('You seem busy. Say `fresh` when you\'re ready.', 'on_timeout')
            convo.activate()
          })
        } else {
          console.log('send message to', user)
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
