import _ from 'lodash'
import Promise from 'bluebird'

import { log } from '../../config'
import { getLearningList, setNewLearning, removeLearning, getMemberWithSkills, sort, getTeachingPeople } from '../index'

export default (bot, message) => Promise.all([getLearningList(message.user), getMemberWithSkills(message.user)])
  .then(([skills, profile]) => bot.createPrivateConversation(message, (err, convo) => {
    if (err) log('the `fresh_learning` conversation', err)

    convo.setTimeout(1500000)
    let learningList = skills
    let ownLearningList = profile.get('Learning')
    ownLearningList.sort(sort)
    learningList.sort(sort)
    const currentLearning = _.map(ownLearningList, ({ text }) => text)
    convo.setVar('currentLearning', currentLearning && currentLearning.length > 0 ? currentLearning.join(', ') : 'No one :thinking_face:')

    convo.addMessage({
      text: `This is your current learning:`,
      attachments: [{
        'title': ':baby: Learning',
        'text': '{{{vars.currentLearning}}}',
        'color': '#FF5722'
      }]
    }, 'default')

    convo.addMessage({
      text: `Your learning can help you to achieve your challenges!`,
      action: 'ask_learning'
    }, 'default')

    convo.addQuestion({
      attachments: [{
        title: 'What do you want to do?',
        callback_id: 'ask_learning',
        attachment_type: 'default',
        actions: [
          {
            name: 'add_learning',
            text: 'Add a learning',
            value: 'Add a learning',
            type: 'button',
            style: 'primary'
          },
          {
            name: 'remove_learning',
            text: 'Remove a learning',
            value: 'Remove a learning',
            type: 'button',
            style: 'danger'
          },
          {
            name: 'teaching_people',
            text: 'Display teaching people',
            value: 'Display teaching people',
            type: 'button'
          },
          {
            name: 'exit',
            text: 'Do nothing',
            value: 'Do nothing',
            type: 'button'
          }
        ]
      }]
    }, function (reply, convo) {
      if (reply.callback_id === 'ask_learning') {
        bot.replyInteractive(reply, {
          attachments: [{
            title: 'What do you want to do?',
            text: `_${reply.actions[0].value}_`,
            mrkdwn_in: ['text']
          }]
        })
        convo.gotoThread(reply.actions[0].name)
        convo.next()
      }
    }, {}, 'ask_learning')

    convo.beforeThread('teaching_people', (convo, next) => {
      console.log(ownLearningList)
      Promise.all(_.map(ownLearningList, ({ text }) => getTeachingPeople(text)
        .then(teachingPeople => (teachingPeople.length > 0 ? { learning: text, teachingPeople } : null))))
        .then((res) => {
          const list = _.compact(res)
          if (ownLearningList.length === 0) {
            convo.gotoThread('no_learning')
          } else if (list.length === 0) {
            convo.gotoThread('no_people')
          } else {
            let text = ''
            list.forEach(({ learning, teachingPeople }) => {
              if (teachingPeople.length > 0) {
                text = text.concat(`*${learning}* can be teaching by `)
                teachingPeople.forEach((id, index) => {
                  if (index === 0) {
                    text = text.concat(`<@${id}>`)
                  } else if (index + 1 === teachingPeople.length) {
                    text = text.concat(` and <@${id}>`)
                  } else {
                    text = text.concat(`, <@${id}>`)
                  }
                })
                text = text.concat('\n')
              }
            })
            convo.setVar('teaching_people', text)
          }
          next()
        })
        .catch((err) => {
          log('the `getTeachingPeople` method', err)
          convo.stop()
          next('stop')
        })
    })

    convo.addMessage({
      text: `You don't have any learning to achieve.`,
      action: 'ask_learning'
    }, 'no_learning')

    convo.addMessage({
      text: `There is no people to learn something from.`,
      action: 'ask_learning'
    }, 'no_people')

    convo.addMessage({
      text: `Here is the list of people that can help you to achieve your learning:`
    }, 'teaching_people')

    convo.addMessage({
      text: '{{{vars.teaching_people}}}'
    }, 'teaching_people')

    convo.addMessage({
      text: `You just have to send a Slack message and ask for a call or a lunch :v:`,
      action: 'ask_learning'
    }, 'teaching_people')

    convo.addQuestion({
      attachments: [{
        title: 'Which learning do you want to add?',
        callback_id: 'add_learning',
        attachment_type: 'default',
        actions: [
          {
            name: 'saved',
            text: 'Choose a learning',
            type: 'select',
            options: learningList
          },
          {
            name: 'add_new_learning',
            text: 'Propose a new learning',
            value: 'Propose a new learning',
            type: 'button',
            style: 'primary'
          },
          {
            name: 'ask_learning',
            text: 'Any, go back',
            value: 'Any, go back',
            type: 'button'
          }
        ]
      }]
    }, function (reply, convo) {
      if (reply.callback_id === 'add_learning') {
        const value = reply.actions[0].type === 'select' ? _.find(learningList, { value: reply.actions[0].selected_options[0].value }).text : reply.actions[0].value
        bot.replyInteractive(reply, {
          attachments: [
            {
              title: 'Which learning do you want to add?',
              text: `_${value}_`,
              mrkdwn_in: ['text']
            }
          ]
        })
        convo.gotoThread(reply.actions[0].name)
        convo.next()
      }
    }, { key: 'learning' }, 'add_learning')

    convo.addQuestion({
      text: `What is the name of your new learning?`
    }, (response, convo) => {
      convo.gotoThread('saved')
    }, { key: 'learning' }, 'add_new_learning')

    convo.beforeThread('saved', (convo, next) => {
      const learning = convo.extractResponse('learning')
      setNewLearning(message.user, learning)
        .then((learning) => {
          ownLearningList.push(learning)
          _.remove(learningList, l => _.isEqual(l, learning))
          ownLearningList.sort(sort)
          learningList.sort(sort)
          convo.setVar('learning', learning.text)
          next()
        })
        .catch((err) => {
          log('the `setNewLearning` method', err)
          convo.stop()
          next('stop')
        })
    })

    convo.addQuestion({
      attachments: [{
        title: 'Which learning do you want to remove?',
        callback_id: 'remove_learning',
        attachment_type: 'default',
        actions: [
          {
            name: 'removed',
            text: 'Choose a learning',
            type: 'select',
            options: ownLearningList
          },
          {
            name: 'ask_learning',
            text: 'Any, go back',
            value: 'Any, go back',
            type: 'button'
          }
        ]
      }]
    }, function (reply, convo) {
      if (reply.callback_id === 'remove_learning') {
        const value = reply.actions[0].type === 'select' ? _.find(ownLearningList, { value: reply.actions[0].selected_options[0].value }).text : reply.actions[0].value
        bot.replyInteractive(reply, {
          attachments: [
            {
              title: 'Which learning do you want to remove?',
              text: `_${value}_`,
              mrkdwn_in: ['text']
            }
          ]
        })
        convo.gotoThread(reply.actions[0].name)
        convo.next()
      }
    }, { key: 'learning' }, 'remove_learning')

    convo.beforeThread('removed', (convo, next) => {
      const learning = convo.extractResponse('learning')
      removeLearning(message.user, learning)
        .then((learning) => {
          _.remove(ownLearningList, l => _.isEqual(l, learning))
          learningList.push(learning)
          ownLearningList.sort(sort)
          learningList.sort(sort)
          convo.setVar('learning', learning.text)
          next()
        })
        .catch((err) => {
          log('the `removeLearning` method', err)
          convo.stop()
          next('stop')
        })
    })

    convo.addMessage({
      text: `Awesome, your new learning *{{{vars.learning}}}* has been successfully saved! :rocket:`,
      action: 'ask_learning'
    }, 'saved')

    convo.addMessage({
      text: `Your old learning *{{{vars.learning}}}* has been successfully removed!`,
      action: 'ask_learning'
    }, 'removed')

    convo.addMessage({
      text: `Okay, see you! :wave:`
    }, 'exit')

    convo.addMessage('Hum... you seem busy. Come back say `learning` when you want!', 'on_timeout')

    convo.activate()
  }))
  .catch((err) => log('the `getLearningList` or `getMemberWithSkills` method', err))
