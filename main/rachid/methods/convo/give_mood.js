/* eslint-disable standard/array-bracket-even-spacing,standard/object-curly-even-spacing */
import {
  getEmoji,
  getTitle,
  saveMood,
  saveMoodDescription
} from '../index'
import { log } from '../../config'

export default (bot, message) => bot.createPrivateConversation(message, (err, convo) => {
  if (err) log('the `give_mood` conversation', err)

  convo.setTimeout(1800000)

  convo.addQuestion({
    text: [`Hello  <@${message.user}>!`, `Hey  <@${message.user}>!`, `Aloha  <@${message.user}>!`][Math.floor(Math.random() * 3)],
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
      const value = parseInt(reply.actions[0].value, 10)
      bot.replyInteractive(reply, {
        attachments: [{
          title: 'What is your mood.js today?',
          text: `_Your mood today is ${getEmoji(value)}_`,
          mrkdwn_in: ['text']
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

  convo.addMessage({ text: ['Bravo! :surfer:', 'Congrats! :100:', 'Whoopee! :dizzy:', 'You\'re on fire :fire:', 'Keep it up :point_up:'][Math.floor(Math.random() * 5)], action: 'description' }, 'five')

  convo.addMessage({ text: ['Oh, looking good! :hugging_face:', 'Life\'s good, right? :cherry_blossom:', 'Sweet! :strawberry:' ][Math.floor(Math.random() * 3)], action: 'description' }, 'four')

  convo.addMessage({ text: ['Thanks for recording your mood.js :slightly_smiling_face:', 'Okay! :+1:', 'Thank you :sparkling_heart:'][Math.floor(Math.random() * 3)], action: 'description' }, 'three')

  convo.addMessage({ text: [':bow: Something\'s wrong?', 'Ouch :disappointed:', 'Feel better soon :pensive:'][Math.floor(Math.random() * 3)], action: 'description' }, 'two')

  convo.addMessage({ text: ['Oh no, sad to hear that :worried:', 'Oh :pensive:', 'I hope it\'ll get better soon.'][Math.floor(Math.random() * 3)]}, 'one')
  convo.addMessage({
    text: 'We\'re here to help you, if you feel like sharing :couple_with_heart:',
    action: 'description'
  }, 'one')

  convo.beforeThread('description', (convo, next) => {
    saveMood(message.user, convo.vars.level)
      .then(moodId => {
        convo.setVar('moodId', moodId)
        next()
      })
      .catch((err) => {
        log('the `saveMood` method', err)
        convo.stop()
        next('stop')
      })
  })

  convo.addQuestion({
    attachments: [{
      title: getTitle(convo.vars.moodId),
      callback_id: 'describe_feelings',
      attachment_type: 'default',
      actions: [
        {
          name: 'comments',
          text: 'Yes',
          type: 'button',
          style: 'primary',
          value: 'Yes'
        },
        {
          name: 'exit',
          text: 'No',
          type: 'button',
          value: 'No'
        }
      ]
    }]
  }, (reply, convo) => {
    if (reply.callback_id === 'describe_feelings') {
      bot.replyInteractive(reply, {
        attachments: [{
          title: getTitle(convo.vars.moodId),
          text: `_${reply.actions[0].value}_`,
          mrkdwn_in: ['text']
        }]
      })
      convo.gotoThread(reply.actions[0].name)
      convo.next()
    }
  }, {}, 'description')

  convo.addQuestion({
    text: `Tell me more about how you feel:`
  }, (response, convo) => {
    convo.gotoThread('saved')
  }, { key: 'comment' }, 'comments')

  convo.beforeThread('saved', (convo, next) => {
    const comment = convo.extractResponse('comment')
    saveMoodDescription(convo.vars.moodId, comment)
      .then(() => next())
      .catch((err) => {
        log('the `saveMood` method', err)
        convo.stop()
        next('stop')
      })
  })

  convo.addMessage({
    text: ['Awesome, it has been successfully saved!', 'Perfect!', 'Sounds good!', 'Thank you!'][Math.floor(Math.random() * 4)],
    action: 'exit'
  }, 'saved')

  convo.addMessage({
    text: `See you tomorrow, take care :heart:`
  }, 'exit')

  convo.onTimeout((convo) => {
    convo.say('Hum... you seem busy. Come back say `mood` when you want!')
    convo.stop()
    convo.next()
  })

  convo.activate()
})
