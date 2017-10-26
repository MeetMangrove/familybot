import {
  getEmoji,
  saveMood,
  saveMoodDescription,
} from '../methods'

let timeout
const delayMessage = (bot, id, convo) => setTimeout((bot, channel, convo) => {
  bot.say({ text: 'Hum... you seem busy. Come back say `mood` when you want!', channel })
  convo.stop()
}, 1800000, bot, id, convo)

export default (convo, name, id) => {
  try {
    convo.beforeThread('default', async function (convo, next) {
      timeout = delayMessage(bot, id, convo)
      next()
    })

    convo.addQuestion({
      text: `Hello ${name}!`,
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
            text: ':persevere:',
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
            text: ':sunglasses:',
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
            attachment_type: 'default',
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
    })

    convo.addMessage({ text: 'Bravo :surfer:' }, 'five')
    convo.addMessage({ text: 'Today is YOUR day!' }, 'five')
    convo.addMessage({ text: 'Enjoy it :wink:', action: 'description' }, 'five')

    convo.addMessage({ text: 'Oh, I love this mood! :hugging_face:', action: 'description' }, 'four')

    convo.addMessage({ text: 'Why don\'t you smile?' }, 'three')
    convo.addMessage({ text: 'Life is full of shining things :blush:', action: 'description' }, 'three')

    convo.addMessage({ text: 'Something wrong?' }, 'two')
    convo.addMessage({ text: 'Don\'t worry, I guess it\'s not the end of the world :wink:' }, 'two')
    convo.addMessage({ text: 'Maybe sharing your feelings could make you more peaceful?', action: 'description' }, 'two')

    convo.addMessage({ text: 'Okay, so you have a real problem.' }, 'one')
    convo.addMessage({ text: 'I hope it is not to bad.' }, 'one')
    convo.addMessage({ text: 'Maybe talking about it could help you to feel good.', action: 'description' }, 'one')

    convo.beforeThread('description', async function (convo, next) {
      const moodId = await saveMood(name, convo.vars.level)
      convo.setVar('moodId', moodId)
      timeout = delayMessage(bot, id, convo)
      next()
    })

    convo.addQuestion({
      attachments: [{
        title: 'Do you want to describe your feelings?',
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
          },
        ]
      }]
    }, (reply, convo) => {
      if (reply.callback_id === 'describe_feelings') {
        if (reply.actions[0].value === 'yes') {
          bot.replyInteractive(reply, {
            attachments: [{
              title: 'Do you want to describe your feelings?',
              callback_id: 'describe_feelings',
              attachment_type: 'default',
              text: '_Yes_',
              mrkdwn_in: ["text"]
            }]
          })
          convo.gotoThread('comments')
          convo.next()
        } else {
          bot.replyInteractive(reply, {
            attachments: [{
              title: 'Do you want to describe your feelings?',
              callback_id: 'describe_feelings',
              attachment_type: 'default',
              text: '_No_',
              mrkdwn_in: ["text"]
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
      action: 'bye',
    }, 'saved')

    convo.addMessage({
      text: `See you tomorrow, take care :heart:`
    }, 'bye')

  } catch (e) {
    console.log(e)
    bot.say({ user: id }, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
}
