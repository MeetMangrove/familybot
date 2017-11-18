import {
  getEmoji,
  getTitle,
  saveMood,
  saveMoodDescription
} from './methods'

const delayMessage = (bot, slackId, convo) => setTimeout((bot, channel, convo) => {
  bot.say({ text: 'Hum... you seem busy. Come back say `mood` when you want!', channel })
  convo.stop()
}, 1800000, bot, slackId, convo)

export default ({ bot, convo, slackId }) => {
  let timeout = delayMessage(bot, slackId, convo)

  convo.addQuestion({
    text: `Hello <@${slackId}>!`,
    attachments: [{
      title: 'What is your mood today?',
      callback_id: 'get_mood',
      attachment_type: 'default',
      actions: [
        {
          name: 'one',
          text: ':skull:',
          type: 'button',
          style: 'danger',
          value: '1'
        },
        {
          name: 'two',
          text: ':cold_sweat:',
          type: 'button',
          value: '2'
        },
        {
          name: 'three',
          text: ':neutral_face:',
          type: 'button',
          value: '3'
        },
        {
          name: 'four',
          text: ':smile:',
          type: 'button',
          value: '4'
        },
        {
          name: 'five',
          text: ':tada:',
          type: 'button',
          style: 'primary',
          value: '5'
        }
      ]
    }]
  }, (reply, convo) => {
    if (reply.callback_id === 'get_mood') {
      clearTimeout(timeout)
      const value = parseInt(reply.actions[0].value, 10)
      bot.replyInteractive(reply, {
        attachments: [{
          title: 'What is your mood today?',
          text: `Your mood today is ${getEmoji(value)}`,
          callback_id: 'update_info',
          attachment_type: 'default'
        }]
      })
      convo.setVar('level', value)
      if (value === 1) {
        convo.gotoThread('one')
      } else if (value === 2) {
        convo.gotoThread('two')
      } else if (value === 3) {
        convo.gotoThread('three')
      } else if (value === 4) {
        convo.gotoThread('four')
      } else if (value === 5) {
        convo.gotoThread('five')
      }
      convo.next()
    }
  }, {}, 'default')

  convo.addMessage({ text: 'Bravo! :surfer:', action: 'description' }, 'five')

  convo.addMessage({ text: 'Oh, looking good! :hugging_face:', action: 'description' }, 'four')

  convo.addMessage({ text: 'Thanks for recording your mood :slightly_smiling_face:', action: 'description' }, 'three')

  convo.addMessage({ text: ':bow: Something\'s wrong?', action: 'description' }, 'two')

  convo.addMessage({ text: 'Oh no, sad to hear that :worried:' }, 'one')
  convo.addMessage({ text: 'I hope it\'ll get better soon.' }, 'one')
  convo.addMessage({
    text: 'We\'re here to help you, if you feel like sharing :couple_with_heart:',
    action: 'description'
  }, 'one')

  convo.beforeThread('description', async function (convo, next) {
    const moodId = await saveMood(slackId, convo.vars.level)
    convo.setVar('moodId', moodId)
    timeout = delayMessage(bot, slackId, convo)
    next()
  })

  convo.addQuestion({
    attachments: [{
      title: getTitle(convo.vars.moodId),
      callback_id: 'describe_feelings',
      attachment_type: 'default',
      actions: [
        {
          name: 'yes',
          text: 'Yes',
          type: 'button',
          style: 'primary',
          value: 'yes'
        },
        {
          name: 'no',
          text: 'No',
          type: 'button',
          value: 'no'
        }
      ]
    }]
  }, (reply, convo) => {
    if (reply.callback_id === 'describe_feelings') {
      if (reply.actions[0].value === 'yes') {
        bot.replyInteractive(reply, {
          attachments: [{
            title: getTitle(convo.vars.moodId),
            callback_id: 'describe_feelings',
            attachment_type: 'default',
            text: '_Yes_',
            mrkdwn_in: ['text']
          }]
        })
        convo.gotoThread('comments')
        convo.next()
      } else {
        clearTimeout(timeout)
        bot.replyInteractive(reply, {
          attachments: [{
            title: getTitle(convo.vars.moodId),
            callback_id: 'describe_feelings',
            attachment_type: 'default',
            text: '_No_',
            mrkdwn_in: ['text']
          }]
        })
        convo.gotoThread('bye')
        convo.next()
      }
    }
  }, {}, 'description')

  convo.addQuestion({
    text: `Tell me more about how you feel:`
  }, (response, convo) => {
    clearTimeout(timeout)
    convo.gotoThread('saved')
  }, { key: 'comment' }, 'comments')

  convo.beforeThread('saved', async function (convo, next) {
    const comment = convo.extractResponse('comment')
    await saveMoodDescription(convo.vars.moodId, comment)
    next()
  })

  convo.addMessage({
    text: `Awesome, it has been successfully saved!`,
    action: 'bye'
  }, 'saved')

  convo.addMessage({
    text: `See you tomorrow, take care :heart:`
  }, 'bye')
}
