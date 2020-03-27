import getMood from '../methods/convo/get_mood'
import { bots } from '../config'

require('dotenv').config()

const channelName = process.env.MOOD_CHANNEL_NAME

export default async function () {
  try {
    await getMood(bots[0], { channel: `#${channelName}` })
    return { sucess: true }
  } catch (e) {
    return { sucess: false, error: e.message }
  }
}
