/**
 * Created by thomasjeanneau on 20/03/2017.
 */

import 'babel-polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import vhost from 'vhost'

import controller from './controller'
require('dotenv').config()

const { HOSTNAME, PORT } = process.env

if (!HOSTNAME || !PORT) {
  console.log('Error: Specify HOSTNAME and PORT in a .env file')
  process.exit(1)
}

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('port', PORT || 5000)

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

app.use(vhost(HOSTNAME, botApp))
app.listen(app.get('port'), () => console.log(`Ghost of firecrab listening on port ${app.get('port')}!`))
