import { bots } from '../config'
import { getAllMembers } from '../../api/airtable'
import giveMood from '../methods/convo/give_mood'

export default async function () {
  try {
    const members = await getAllMembers()
    const idList = JSON.parse(JSON.stringify(members)).map((d) => d._rawJson.fields['Slack ID'])

    idList.forEach((slackId) => {
      giveMood(bots[0], { user: slackId })
    })
    return { success: true }
  } catch (e) {
    return { success: false, error: e.message }
  }
}
