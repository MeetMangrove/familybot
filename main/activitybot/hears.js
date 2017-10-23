import { controller } from './config'

require('dotenv').config()

const {NODE_ENV} = process.env

if (!NODE_ENV) {
  console.log('Error: Specify in a .env file')
  process.exit(1)
}

export default controller