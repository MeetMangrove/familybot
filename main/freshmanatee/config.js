/**
 * Created by thomasjeanneau on 08/02/2017.
 */

import Botkit from 'mangrove-botkit'
import FirebaseStorage from 'botkit-storage-firebase'

const bots = []
const {
  NODE_ENV,
  GHOST_SLACK_CLIENT_ID,
  GHOST_SLACK_CLIENT_SECRET,
  GHOST_FIREBASE_URI,
  FRESHMANATEE_SLACK_CLIENT_ID,
  FRESHMANATEE_SLACK_CLIENT_SECRET,
  FRESHMANATEE_FIREBASE_URI
} = process.env

export const isProd = NODE_ENV === 'production'

if (!FRESHMANATEE_SLACK_CLIENT_ID || !FRESHMANATEE_SLACK_CLIENT_SECRET || !FRESHMANATEE_FIREBASE_URI) {
  console.log('Error: Specify NEWSBOT_SLACK_CLIENT_ID, NEWSBOT_SLACK_CLIENT_SECRET and NEWSBOT_MONGODB_URI in a .env file')
  process.exit(1)
}

const mongoStorage = new FirebaseStorage({
  firebase_uri: isProd ? FRESHMANATEE_FIREBASE_URI : GHOST_FIREBASE_URI
})

const controller = Botkit.slackbot({
  debug: false,
  interactive_replies: true,
  require_delivery: true,
  storage: mongoStorage,
  app_name: isProd ? 'freshmanatee' : 'ghost'
})

controller.configureSlackApp({
  clientId: isProd ? FRESHMANATEE_SLACK_CLIENT_ID : GHOST_SLACK_CLIENT_ID,
  clientSecret: isProd ? FRESHMANATEE_SLACK_CLIENT_SECRET : GHOST_SLACK_CLIENT_SECRET,
  scopes: ['bot', 'chat:write:bot', 'users:read']
})

controller.on('create_bot', (bot, config) => {
  if (bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM((err) => {
      if (!err) bots.push(bot)
      bot.startPrivateConversation({user: config.createdBy}, (err, convo) => {
        if (err) return console.log(err)
        convo.say(`Hello, I'm <@${bot.identity.id}>!`)
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
      controller
        .spawn(teams[t])
        .startRTM((err, bot) => {
          if (err) return console.log('Error connecting freshmanatee to Slack:', err)
          bots.push(bot)
        })
    }
  }
})

export { controller, bots }
