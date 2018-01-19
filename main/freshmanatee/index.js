import 'babel-polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import vhost from 'vhost'

import controller from './controller'
require('dotenv').config()

const { HOSTNAME } = process.env

if (!HOSTNAME) {
  console.log('Error: Specify HOSTNAME in a .env file')
  process.exit(1)
}

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('port', process.env.PORT || 5000)

console.log(`Mounting ${controller.config.app_name} bot on ${HOSTNAME}`)

const botApp = express()
controller.config.port = app.get('port')
controller.config.hostname = HOSTNAME
controller
  .createWebhookEndpoints(botApp)
  .createHomepageEndpoint(botApp)
  .createOauthEndpoints(botApp, (err, req, res) => {
    if (err) return res.status(500).send('ERROR: ' + err)
    res.send('Success!')
  })

botApp.post(`/${controller.config.app_name}/slack/options-load-endpoint`, (req, res) => {
  res.status(200)
  const data = JSON.parse(req.body.payload)
  if (controller.optionsLoad[data.callback_id]) {
    const options = controller.optionsLoad[data.callback_id](data.value)
    res.json({ options })
  }
})

app.use(vhost(HOSTNAME, botApp))
app.listen(app.get('port'), () => console.log(`Ghost of freshmanatee listening on port ${app.get('port')}!`))
