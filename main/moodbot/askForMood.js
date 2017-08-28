import giveMood from './giveMood'

export default (convo, name) => {
  convo.addQuestion({
    text: 'Do you want to give me your mood of the day now?',
    attachments: [
      {
        title: '',
        callback_id: 'ask_for_mood_callback',
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
        convo.gotoThread('give_mood')
      }
    },
    {
      pattern: 'no',
      callback: function (reply, convo) {
        convo.say(`I will ping you everyday at 3pm to get your mood! :surfer:`)
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
  giveMood(convo, name)
}