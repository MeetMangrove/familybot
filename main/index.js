import 'babel-polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import vhost from 'vhost'

// Import controllers for each bot
import learnbot from './learnbot'
import moodbot from './moodbot'
import newsbot from './freshmanatee'
import firecrab from './firecrab'

dotenv.load({ silent: process.env.NODE_ENV === 'production' })

const {
  NODE_ENV,
  PORT,
  HOSTNAME,
  FORCE_HOSTNAME,
} = process.env

if (!NODE_ENV || !PORT || !HOSTNAME) {
  console.log('Error: Specify NODE_ENV, PORT, HOSTNAME in a .env file')
  process.exit(1)
}

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('port', PORT || 5000)

// Map each bot to its own hostname
// For development you can use ngrok and set up a dedicated *.ngrok.io domain for each bot
// For production, you should set up your DNS to point different domain names to your server
const botSetups = [
  { controller: learnbot },
  { controller: moodbot },
  { controller: newsbot },
  { controller: firecrab }
]

// Optional setting to override the hostname, makes the app behave as if
// all requests were sent to a given Host (useful in development)
if (FORCE_HOSTNAME) {
  const hostname = FORCE_HOSTNAME
  console.log(`WARNING hostname forced to env.FORCE_HOSTNAME=${hostname}`)
  app.use((req, res, next) => {
    req.headers.host = hostname
    next()
  })
}

// Mount the bots on the main app
botSetups.forEach(({ controller }) => {
  console.log(`Mounting ${controller.config.app_name} bot on ${HOSTNAME}`)
  // create a dedicated express app for the bot
  const botApp = express()
  // force port and hostname, used by botkit

  controller.config.port = app.get('port')
  controller.config.hostname = HOSTNAME
  // use botkit to set up endpoints on the dedicated app
  controller
    .createWebhookEndpoints(botApp)
    .createHomepageEndpoint(botApp)
    .createOauthEndpoints(botApp, (err, req, res) => {
      if (err) return res.status(500).send('ERROR: ' + err)
      res.send('Success!')
    })
  // mount the botApp on the main app, on its own hostname
  app.use(vhost(HOSTNAME, botApp))
})

// Start the main app
app.listen(app.get('port'), () => console.log(`Family of ${botSetups.length} bots listening on port ${app.get('port')}!`))
