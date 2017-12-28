import google from 'googleapis'
import GoogleAuth from 'google-auth-library'

const {
  GMAIL_API_CLIENT_ID,
  GMAIL_API_CLIENT_SECRET,
  GMAIL_API_CREDENTIALS
} = process.env

if (!GMAIL_API_CLIENT_ID || !GMAIL_API_CLIENT_SECRET || !GMAIL_API_CREDENTIALS) {
  console.log('Error: Specify GMAIL_API_CLIENT_ID, GMAIL_API_CLIENT_SECRET and GMAIL_API_CREDENTIALS in a .env file')
  process.exit(1)
}

const auth = new GoogleAuth()
const oauth2Client = new auth.OAuth2(GMAIL_API_CLIENT_ID, GMAIL_API_CLIENT_SECRET, 'postmessage')
oauth2Client.credentials = JSON.parse(GMAIL_API_CREDENTIALS)

export default google.gmail({
  version: 'v1',
  auth: oauth2Client
})
