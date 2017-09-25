// There should be two ways to activate the conversation:
// 1- New person joins the general channel
//    They should get a private message with the conversation
// 2- An admin sends a first-time command
//    Every person in the slack should get a private message with the conversation

export default (bot, message, userInfo) => {
  bot.startPrivateConversation(message, (err, convo) => {
    if (err) return console.log(err)
    convo.say(`Hey ${userInfo.name}! :wave:`)
    convo.say(`I'm the Learning Bot, part of the peer-to-peer learning program inside Mangrove.`)
    convo.say(`I have been built to make people inside of Mangrove learn from each other.`)
    convo.say(`Every month, you could be paired with another Mangrover to teach and learn new skills.`)
    convo.ask({
      attachments: [
        {
          title: 'Want to try it out?',
          callback_id: '123',
          attachment_type: 'default',
          actions: [
            {
              'name': 'yes',
              'text': 'Yes',
              'value': 'yes',
              'type': 'button'
            },
            {
              'name': 'no',
              'text': 'No',
              'value': 'no',
              'type': 'button'
            }
          ]
        }
      ]
    }, [
      {
        pattern: 'yes',
        callback: function (reply, convo) {
          convo.say('Amaaaaaaaaaaaazing 🎉')
          convo.say(`I'm your new learning buddy 🐹 please fill in this form to tell me which skills you want to learn and share: https://airtable.com/shrSHhIaFz8A0PRnM`)
          convo.say(`If you ever want to stop being paired, which would be very sad 😥, just tell me \`stop\``)
          convo.say(`And if you need help, just tell me \`help\` :wink:`)
          convo.next()
        }
      },
      {
        pattern: 'no',
        callback: function (reply, convo) {
          convo.say('Okay, just know that you can start anytime, just go back to see me when you feel ready.')
          convo.next()
        }
      },
      {
        default: true,
        callback: function () {
          console.log('default')
          // do nothing
        }
      }
    ])
  })
}
