/* eslint-disable camelcase */
import nodemailer from 'nodemailer'

require('dotenv').config()

const { EMAIl_USER, EMAIL_PASS } = process.env

if (!EMAIl_USER && !EMAIL_PASS) {
  console.log('Error: Specify EMAIl_USER and EMAIL_PASS in a .env file')
  process.exit(1)
}

// create reusable transporter object using the default SMTP transport
export default nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: EMAIl_USER, // generated ethereal user
    pass: EMAIL_PASS  // generated ethereal password
  }
})
