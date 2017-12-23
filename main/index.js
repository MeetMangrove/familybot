import 'babel-polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import vhost from 'vhost'

import rachid from './rachid/controller'
import firecrab from './firecrab/controller'
import freshmanatee from './freshmanatee/controller'

dotenv.load({ silent: process.env.NODE_ENV === 'production' })

const {
  NODE_ENV,
  HOSTNAME
} = process.env

if (!NODE_ENV || !HOSTNAME) {
  console.log('Error: Specify NODE_ENV and HOSTNAME in a .env file')
  process.exit(1)
}

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('port', process.env.PORT || 5000)

const bots = [rachid, firecrab, freshmanatee]

const mountBot = (controller) => {
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
}

// Mount the bots on the main app
bots.forEach(controller => mountBot(controller))

// Start the main app
app.listen(app.get('port'), () => console.log(`Family of ${bots.length} bots listening on port ${app.get('port')}!`))
