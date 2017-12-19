import 'babel-polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import vhost from 'vhost'

dotenv.load({ silent: process.env.NODE_ENV === 'production' })

const {
  BOT,
  NODE_ENV,
  GHOST_HOSTNAME
} = process.env

if (!NODE_ENV || !GHOST_HOSTNAME) {
  console.log('Error: Specify NODE_ENV and GHOST_HOSTNAME in a .env file')
  process.exit(1)
}

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('port', process.env.PORT || 5000)

const mountBot = (controller) => {
  console.log(`Mounting ${controller.config.app_name} bot on ${GHOST_HOSTNAME}`)
  // create a dedicated express app for the bot
  const botApp = express()
  // force port and hostname, used by botkit

  controller.config.port = app.get('port')
  controller.config.hostname = GHOST_HOSTNAME
  // use botkit to set up endpoints on the dedicated app
  controller
    .createWebhookEndpoints(botApp)
    .createHomepageEndpoint(botApp)
    .createOauthEndpoints(botApp, (err, req, res) => {
      if (err) return res.status(500).send('ERROR: ' + err)
      res.send('Success!')
    })
  // mount the botApp on the main app, on its own hostname
  app.use(vhost(GHOST_HOSTNAME, botApp))
}

if (NODE_ENV === 'production') {
  // Import controllers for each bot
  // You should set up your DNS to point different domain names to your server
  Promise.all([
    import('./rachid'),
    import('./freshmanatee'),
    import('./firecrab')
  ])
    .then((bots) => {
      // Mount the bots on the main app
      bots.forEach(({ default: controller }) => mountBot(controller))
      // Start the main app
      app.listen(app.get('port'), () => console.log(`Family of ${bots.length} bots listening on port ${app.get('port')}!`))
    })
    .catch((err) => console.log(err))
} else if (NODE_ENV === 'development') {
  // Ask for the bot to test
  // You can use ngrok
  import(`./${BOT}`)
    .then(({ default: controller }) => {
      mountBot(controller)
      app.listen(app.get('port'), () => console.log(`Ghost of ${BOT} listening on port ${app.get('port')}!`))
    })
    .catch((err) => console.log(err))
}
