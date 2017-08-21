/**
 * Created by thomasjeanneau on 08/02/2017.
 */

import Botkit from 'mangrove-botkit'
import BotkitStorageMongo from 'botkit-storage-mongo'

const bots = {}
const {
  NEWSBOT_SLACK_CLIENT_ID,
  NEWSBOT_SLACK_CLIENT_SECRET,
  NEWSBOT_MONGODB_URI
} = process.env

if (!NEWSBOT_SLACK_CLIENT_ID || !NEWSBOT_SLACK_CLIENT_SECRET || !NEWSBOT_MONGODB_URI) {
  console.log('Error: Specify NEWSBOT_SLACK_CLIENT_ID, NEWSBOT_SLACK_CLIENT_SECRET and NEWSBOT_MONGODB_URI in a .env file')
  process.exit(1)
}

const trackBot = (bot) => {
  bots[bot.config.token] = bot
}

const mongoStorage = new BotkitStorageMongo({
  mongoUri: NEWSBOT_MONGODB_URI
})

const controller = Botkit.slackbot({
  debug: false,
  interactive_replies: true,
  require_delivery: true,
  storage: mongoStorage,
  app_name: 'newsbot'
})

controller.configureSlackApp({
  clientId: NEWSBOT_SLACK_CLIENT_ID,
  clientSecret: NEWSBOT_SLACK_CLIENT_SECRET,
  scopes: ['bot', 'chat:write:user', 'im:history', 'im:read', 'users:read']
})

controller.on('create_bot', (bot, config) => {
  if (bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM((err) => {
      if (!err) trackBot(bot)
      bot.startPrivateConversation({user: config.createdBy}, (err, convo) => {
        if (err) return console.log(err)
        convo.say('I am a newsbot that has just joined your team')
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
        if (err) return console.log('Error connecting newsbot to Slack:', err)
        trackBot(bot)
      })
    }
  }
})

export { controller, bots }
