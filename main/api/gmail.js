import fs from 'fs'
import google from 'googleapis'
import GoogleAuth from 'google-auth-library'

const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/'
const TOKEN_PATH = TOKEN_DIR + 'gmail.json'

const credentials = JSON.parse(fs.readFileSync('client_secret.json'))
if (!credentials) {
  console.log('Error: client_secret.json is missing, specify the file for the Gmail API.')
  process.exit(1)
}

const token = JSON.parse(fs.readFileSync(TOKEN_PATH))
if (!credentials) {
  console.log('Error: Gmail API token is missing, you have to run task credentials_gmail.')
  process.exit(1)
}

const clientSecret = credentials.web.client_secret
const clientId = credentials.web.client_id
const redirectUrl = credentials.web.redirect_uris[0]
const auth = new GoogleAuth()
const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)
oauth2Client.credentials = token

export default google.gmail({
  version: 'v1',
  auth: oauth2Client
})
