import _ from 'lodash'

export default {

  // get slack user info by slack id
  user: async function (bot, slackId) {
    const apiUser = Promise.promisifyAll(bot.api.users)
    const res = await apiUser.infoAsync({ user: slackId })
    if (res.error) throw new Error(res.error)
    return res.user
  },

  // get all slack members
  all: async function (bot) {
    const apiUser = Promise.promisifyAll(bot.api.users)
    const res = await apiUser.listAsync({ token: bot.config.bot.app_token })
    if (res.error) throw new Error(res.error)
    await _.remove(res.members, async ({ id: slackId }) => await this.isBot(bot, slackId) === true)
    return res.members
  },

  // check if the slack id is one of a bot
  isBot: async function (bot, slackId) {
    const user = await this.user(bot, slackId)
    return user.is_bot
  }
}
