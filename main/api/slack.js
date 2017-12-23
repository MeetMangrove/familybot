import _ from 'lodash'
import Promise from 'bluebird'

export default {

  // get all slack members
  all: async function (bot) {
    const apiUser = Promise.promisifyAll(bot.api.users)
    const res = await apiUser.listAsync({ token: bot.config.bot.app_token })
    if (res.error) throw new Error(res.error)
    _.remove(res.members, ({ is_bot: isBot, deleted }) => isBot === true || deleted === true)
    return res.members
  }
}
