const fs = require('fs')
const readline = require('readline')
const GoogleAuth = require('google-auth-library')

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail.json
const SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send'
]
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/'
const TOKEN_PATH = TOKEN_DIR + 'gmail.json'

fs.readFile('client_secret.json', function processClientSecrets (err, content) {
  if (err) return console.log('Error loading client secret file: ' + err)
  const credentials = JSON.parse(content)
  const clientSecret = credentials.web.client_secret
  const clientId = credentials.web.client_id
  const redirectUrl = credentials.web.redirect_uris[0]
  const auth = new GoogleAuth()
  const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })
  console.log('Authorize this app by visiting this url: ', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close()
    oauth2Client.getToken(code, function (err, token) {
      if (err) return console.log('Error while trying to retrieve access token', err)
      fs.writeFile(TOKEN_PATH, JSON.stringify(token))
      console.log('Token: ', token)
      console.log('Stored to ' + TOKEN_PATH)
    })
  })
})
