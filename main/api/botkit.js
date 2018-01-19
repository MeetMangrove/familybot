/**
 * Created by thomasjeanneau on 08/02/2017.
 */

import Botkit from 'mangrove-botkit'
import FirebaseStorage from 'botkit-storage-firebase'
require('dotenv').config()

const {
  NODE_ENV,
  GHOST_SLACK_CLIENT_ID,
  GHOST_SLACK_CLIENT_SECRET,
  GHOST_FIREBASE_URI,
  SLACK_TEAM_ID
} = process.env

if (!NODE_ENV || (NODE_ENV !== 'production' && (!GHOST_SLACK_CLIENT_ID || !GHOST_SLACK_CLIENT_SECRET || !GHOST_FIREBASE_URI)) || !SLACK_TEAM_ID) {
  console.log('Error: Specify NODE_ENV, GHOST_SLACK_CLIENT_ID, GHOST_SLACK_CLIENT_SECRET, GHOST_FIREBASE_URI and SLACK_TEAM_ID in a .env file')
  process.exit(1)
}

export default ({ SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, FIREBASE_URI, name, scopes }) => {
  const bots = []
  const isProd = NODE_ENV === 'production'

  const mongoStorage = new FirebaseStorage({
    firebase_uri: isProd ? FIREBASE_URI : GHOST_FIREBASE_URI
  })

  const controller = Botkit
    .slackbot({
      debug: false,
      interactive_replies: true,
      require_delivery: true,
      storage: mongoStorage,
      app_name: isProd ? name : 'ghost'
    })
    .configureSlackApp({
      clientId: isProd ? SLACK_CLIENT_ID : GHOST_SLACK_CLIENT_ID,
      clientSecret: isProd ? SLACK_CLIENT_SECRET : GHOST_SLACK_CLIENT_SECRET,
      scopes
    })

  const startRTM = (bot) => {
    bot.startRTM((err, bot) => {
      if (err) return console.log(err)
      bots.push(bot)
    })
  }

  controller.storage.teams.get(SLACK_TEAM_ID, (err, team) => {
    if (err) return console.log(err)
    startRTM(controller.spawn(team))
  })

  controller.on('create_bot', bot => startRTM(bot))
  controller.on('rtm_close', bot => startRTM(bot))

  controller.optionsLoad = []

  return { controller, bots, isProd }
}
