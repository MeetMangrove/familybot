export default (convo) => {
  convo.addQuestion({
    text: 'Did you meet ?',
    attachments: [
      {
        title: '',
        callback_id: 'ask_if_meeting_callback',
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
          },
        ]
      }
    ]
  }, [
    {
      pattern: 'yes',
      callback: async function (reply, convo) {
        convo.gotoThread('feedback')
      }
    },
    {
      pattern: 'no',
      callback: function (reply, convo) {
        convo.say(`Alright, tell me when you have scheduled it. `)
        convo.next()
      }
    },
    {
      default: true,
      callback: function () {
        convo.repeat()
        convo.next()
      }
    }

  ], {}, 'default')

  convo.beforeThread('feedback', async function (convo, next) {
    await meetingDone(id)
    next()
  })

  convo.addQuestion({
    text: 'Awesome 🎉 how was it ? Give me some feedback! Even a word is fine.',
  }, (response, convo) => {
    saveFeedback()
    convo.addMessage({
      text: `Thank you ❤`
    }, 'feedback')
  }, { key: 'feedback'}, 'feedback')
}