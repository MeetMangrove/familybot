/**
 * Created by thomasjeanneau on 08/02/2017.
 */

import Botkit from 'mangrove-botkit'
import BotkitStorageMongo from 'botkit-storage-mongo'

const _bots = {}
const {
  LEARNBOT_SLACK_CLIENT_ID,
  LEARNBOT_SLACK_CLIENT_SECRET,
  LEARNBOT_MONGODB_URI
} = process.env

if (!LEARNBOT_SLACK_CLIENT_ID || !LEARNBOT_SLACK_CLIENT_SECRET || !LEARNBOT_MONGODB_URI) {
  console.log('Error: Specify LEARNBOT_SLACK_CLIENT_ID, LEARNBOT_SLACK_CLIENT_SECRET and LEARNBOT_MONGODB_URI in a .env file')
  process.exit(1)
}

const trackBot = (bot) => {
  _bots[bot.config.token] = bot
}

const mongoStorage = new BotkitStorageMongo({
  mongoUri: LEARNBOT_MONGODB_URI
})

const controller = Botkit.slackbot({
  debug: false,
  interactive_replies: true,
  require_delivery: true,
  storage: mongoStorage,
  app_name: 'learnbot'
})

controller.configureSlackApp({
  clientId: LEARNBOT_SLACK_CLIENT_ID,
  clientSecret: LEARNBOT_SLACK_CLIENT_SECRET,
  scopes: ['bot', 'chat:write:bot', 'groups:history', 'groups:read', 'groups:write', 'users:read', 'users:read.email']
})

controller.on('create_bot', (bot, config) => {
  if (_bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM((err) => {
      if (!err) trackBot(bot)
      bot.startPrivateConversation({user: config.createdBy}, (err, convo) => {
        if (err) return console.log(err)
        convo.say('I am a bot that has just joined your team')
        convo.say('You must now /invite me to a channel so that I can be of use!')
      })
    })
  }
})

controller.on('rtm_open', () => {
  console.log('** The RTM api just connected!')
})

controller.on('rtm_close', () => {
  console.log('** The RTM api just closed')
})

controller.storage.teams.all((err, teams) => {
  if (err) throw new Error(err)
  for (let t in teams) {
    if (teams[t].bot) {
      controller.spawn(teams[t]).startRTM((err, bot) => {
        if (err) return console.log('Error connecting bot to Slack:', err)
        trackBot(bot)
      })
    }
  }
})

export { controller }
