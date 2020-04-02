import Airtable from 'airtable'
import Promise from 'bluebird'

require('dotenv').config()

const {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_KEY
} = process.env

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_KEY) {
  console.log('Error: Specify AIRTABLE_API_KEY and AIRTABLE_BASE_KEY in a .env file')
  process.exit(1)
}

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: AIRTABLE_API_KEY
})

// allows accessing tables directly
export const base = Airtable.base(AIRTABLE_BASE_KEY)

// reads all records from a table
export const _getAllRecords = (select) => {
  return new Promise((resolve, reject) => {
    let allRecords = []
    select.eachPage(function page (records, fetchNextPage) {
      allRecords = allRecords.concat(records)
      fetchNextPage()
    }, function done (err) {
      if (err) return reject(err)
      resolve(allRecords)
    })
  })
}

// reads all records from a table
export const getAllMembers = async () => {
  const records = await _getAllRecords(base('Members').select({
    view: 'Familybot View'
  }))
  return records
}

// get a member by Slack ID or Airtable ID
export const getMember = async (id) => {
  const regExSlackId = /^U[A-Z0-9]{8}$/g
  const regExAirtableId = /^rec[a-zA-Z0-9]{14}$/g
  if (regExSlackId.test(id) === true) {
    const records = await _getAllRecords(base('Members').select({
      view: 'Familybot View',
      filterByFormula: `(FIND("${id}",{Slack ID}))`,
      maxRecords: 1
    }))
    if (records[0]) return records[0]
    throw new Error(`Slack ID ${id} doesn't exist.`)
  } else if (regExAirtableId.test(id) === true) {
    const findMember = Promise.promisify(base('Members').find)
    const member = await findMember(id)
    if (member) return member
    throw new Error(`Airtable ID ${id} doesn't exist.`)
  }
  throw new Error(`${id} is not a Slack ID or a Airtable ID.`)
}
