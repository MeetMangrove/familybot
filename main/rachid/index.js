/**
 * Created by thomasjeanneau on 20/03/2017.
 */

import 'babel-polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import vhost from 'vhost'

import controller from './controller'
import askMood from './crons/ask_mood'
import sendMood from './crons/send_mood'

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

botApp.get(`/${controller.config.app_name}/ask_mood`, async (req, res) => {
  const result = await askMood();
  res.json(result)
})

botApp.get(`/${controller.config.app_name}/send_mood`, async (req, res) => {
  const result = await sendMood();
  res.json(result)
})

controller
  .createWebhookEndpoints(botApp)
  .createHomepageEndpoint(botApp)
  .createOauthEndpoints(botApp, (err, req, res) => {
    if (err) return res.status(500).send('ERROR: ' + err)
    res.send('Success!')
  })

app.use(vhost(HOSTNAME, botApp))
app.listen(app.get('port'), () => console.log(`Ghost of rachid listening on port ${app.get('port')}!`))
