import { controller } from './config'

require('dotenv').config()

const {
  ACTIVITYBOT_COMMAND_TOKEN_1,
  ACTIVITYBOT_COMMAND_TOKEN_2,
} = process.env

if (!ACTIVITYBOT_COMMAND_TOKEN_1 || !ACTIVITYBOT_COMMAND_TOKEN_2) {
  console.log('Error: Specify ACTIVITYBOT_COMMAND_TOKEN_1 & ACTIVITYBOT_COMMAND_TOKEN_2 in a .env file')
  process.exit(1)
}

controller.on('slash_command', function (bot, message) {
  // Validate Slack verify token
  if (message.token !== ACTIVITYBOT_COMMAND_TOKEN_1 && message.token !== ACTIVITYBOT_COMMAND_TOKEN_2) {
    return bot.res.send(401, 'Unauthorized')
  }

  console.log(message)

  switch (message.command) {
    case '/done':
      bot.replyPrivate(message, 'yolo done!')
      break
    case '/thanks':
      bot.replyPrivate(message, 'yolo thanks!')
      break
    default:
      bot.replyPrivate(message, "Sorry, I'm not sure what that command is")
  }
})

export default controller