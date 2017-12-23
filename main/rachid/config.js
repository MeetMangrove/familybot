/**
 * Created by thomasjeanneau on 08/02/2017.
 */

import botkit from '../api/botkit'
require('dotenv').config()

const {
  RACHID_SLACK_CLIENT_ID,
  RACHID_SLACK_CLIENT_SECRET,
  RACHID_FIREBASE_URI
} = process.env

if (!RACHID_SLACK_CLIENT_ID || !RACHID_SLACK_CLIENT_SECRET || !RACHID_FIREBASE_URI) {
  console.log('Error: Specify RACHID_SLACK_CLIENT_ID, RACHID_SLACK_CLIENT_SECRET and RACHID_FIREBASE_URI in a .env file')
  process.exit(1)
}

const { controller, bots, isProd } = botkit({
  SLACK_CLIENT_ID: RACHID_SLACK_CLIENT_ID,
  SLACK_CLIENT_SECRET: RACHID_SLACK_CLIENT_SECRET,
  FIREBASE_URI: RACHID_FIREBASE_URI,
  name: 'rachid',
  scopes: ['bot', 'chat:write:bot', 'users:read']
})

const log = (context, e) => {
  console.log(e)
  const text = [
    `Oops..! :sweat_smile: There is something wrong with ${context}: \`${e.message || e.error || e}\``,
    `:bug: *BUG BUG BUG* :bug: Check ${context}, I've noticed that: \`${e.message || e.error || e}\``,
    `Damned! :rage: Something in ${context} is broken: \`${e.message || e.error || e}\``,
    `WHAT? :scream: ${context} doesn't work: \`${e.message || e.error || e}\``
  ][Math.floor(Math.random() * 4)]
  bots[0].say({ text, channel: isProd ? '#mangrove-tech' : '#ghost-playground' })
  return text
}

export { log, isProd, bots }
export default controller
