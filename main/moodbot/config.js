/**
 * Created by thomasjeanneau on 08/02/2017.
 */

import localTunnel from 'localtunnel'
import Botkit from 'mangrove-botkit'
import BotkitStorageMongo from 'botkit-storage-mongo'

require('dotenv').config()

const bots = {}
const {
  MOODBOT_SLACK_CLIENT_ID,
  MOODBOT_SLACK_CLIENT_SECRET,
  MOODBOT_PORT,
  MOODBOT_MONGODB_URI,
  NODE_ENV
} = process.env

if (!MOODBOT_SLACK_CLIENT_ID || !MOODBOT_SLACK_CLIENT_SECRET || !MOODBOT_PORT || !MOODBOT_MONGODB_URI || !NODE_ENV) {
  console.log('Error: Specify MOODBOT_SLACK_CLIENT_ID, MOODBOT_SLACK_CLIENT_SECRET, MOODBOT_PORT and MOODBOT_MONGODB_URI in a .env file')
  process.exit(1)
}

if (NODE_ENV === 'DEVELOPMENT') {
  const tunnel = localTunnel(MOODBOT_PORT, {subdomain: 'familybot'}, (err, tunnel) => {
    if (err) console.log(err)
    console.log(`Bot running at the url: ${tunnel.url}`)
  })
  tunnel.on('close', () => {
    console.log('Tunnel is closed')
  })
}

const trackBot = (bot) => {
  bots[bot.config.token] = bot
}

const mongoStorage = new BotkitStorageMongo({
  mongoUri: MOODBOT_MONGODB_URI
})

const controller = Botkit.slackbot({
  debug: false,
  interactive_replies: true,
  require_delivery: true,
  storage: mongoStorage,
  app_name: 'moodbot'
})

controller.configureSlackApp({
  clientId: MOODBOT_SLACK_CLIENT_ID,
  clientSecret: MOODBOT_SLACK_CLIENT_SECRET,
  scopes: ['bot', 'chat:write:bot', 'users:read']
})

controller.setupWebserver(MOODBOT_PORT, (err) => {
  if (err) return console.log(err)
  controller
    .createWebhookEndpoints(controller.webserver)
    .createHomepageEndpoint(controller.webserver)
    .createOauthEndpoints(controller.webserver, (err, req, res) => {
      if (err) return res.status(500).send('ERROR: ' + err)
      res.send('Success!')
    })
})

controller.on('create_bot', (bot, config) => {
  if (bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM((err) => {
      if (!err) trackBot(bot)
      bot.startPrivateConversation({user: config.createdBy}, (err, convo) => {
        if (err) return console.log(err)
        convo.say('I am a moodbot that has just joined your team')
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
        if (err) return console.log('Error connecting moodbot to Slack:', err)
        trackBot(bot)
      })
    }
  }
})

export { controller, bots }
