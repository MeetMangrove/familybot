const { MAILGUN_API_KEY } = process.env

if (!MAILGUN_API_KEY) {
  console.log('Error: Specify MAILGUN_API_KEY in a .env file')
  process.exit(1)
}

const mailgun = require('mailgun-js')({ apiKey: MAILGUN_API_KEY, domain: 'family.mangrove.io' })

export default mailgun
