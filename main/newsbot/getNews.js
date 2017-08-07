/**
 * Created by thomasjeanneau on 31/05/2017.
 */

import _ from 'lodash'
import Promise from 'bluebird'
import asyncForEach from 'async-foreach'

import {
  checkIfBot,
  getTimestamp,
  getUsersAskedByResponsible,
  getAllMembers
} from '../methods'

const {forEach} = asyncForEach

export default async (bot, message, token) => {
  const botReply = Promise.promisify(bot.reply)
  await botReply(message, `Looking for all responses... :sleuth_or_spy:`)
  const usersAsked = await getUsersAskedByResponsible(bot, message.user)
  const allMembers = await getAllMembers(bot)
  const apiIm = Promise.promisifyAll(bot.api.im)
  const {ims} = await apiIm.listAsync({token})
  let count = 0
  let replies = 0
  forEach(ims, async function ({id, user}) {
    const done = this.async()
    if (_.findIndex(usersAsked, userAsked => userAsked === user) > 0) {
      const isBot = await checkIfBot(bot, user)
      if (isBot === false && user !== message.user) {
        replies++
        const lastTs = await getTimestamp(bot, user, allMembers)
        const {messages} = await apiIm.historyAsync({
          token,
          channel: id,
          oldest: lastTs,
          count: 4,
          inclusive: false
        })
        messages.pop()
        if (messages.length > 0) {
          count++
          await botReply(message, {
            text: `:scroll: *News from <@${user}>* :scroll:`,
            attachments: _.reverse(_.map(messages, ({text}) => ({text, mrkdwn_in: ['text']})))
          })
        }
      }
    }
    done()
  }, async () => {
    await botReply(message, `Done! You have ${count} of ${replies} replies :clap:`)
  })
}
