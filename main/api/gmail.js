import google from 'googleapis'
import GoogleAuth from 'google-auth-library'

const {
  GMAIL_API_CLIENT_ID,
  GMAIL_API_CLIENT_SECRET,
  GMAIL_API_ACCESS_TOKEN
} = process.env

if (!GMAIL_API_CLIENT_ID || !GMAIL_API_CLIENT_SECRET || !GMAIL_API_ACCESS_TOKEN) {
  console.log('Error: Specify GMAIL_API_CLIENT_ID, GMAIL_API_CLIENT_SECRET and GMAIL_API_ACCESS_TOKEN in a .env file')
  process.exit(1)
}

const auth = new GoogleAuth()
const oauth2Client = new auth.OAuth2(GMAIL_API_CLIENT_ID, GMAIL_API_CLIENT_SECRET, 'postmessage')
oauth2Client.credentials = JSON.parse(GMAIL_API_ACCESS_TOKEN)

export default google.gmail({
  version: 'v1',
  auth: oauth2Client
})
