import _ from 'lodash'
import Promise from 'bluebird'
import Sifter from 'sifter'

import controller, { log } from '../../config'
import { getLearningList, setNewLearning, removeLearning, getMemberWithSkills, sort, getTeachingPeople } from '../index'

export default (convo, nextThread = 'exit') => {
  convo.addMessage({
    text: 'I\'m looking for your learning :sleuth_or_spy:',
    action: 'get_learning'
  }, 'fresh_learning')

  convo.beforeThread('get_learning', async (convo, next) => {
    const { context: { user } } = convo
    const [learningList, profile] = await Promise.all([getLearningList(user), getMemberWithSkills(user)])
    const ownLearningList = profile.get('Learning')
    ownLearningList.sort(sort)
    learningList.sort(sort)
    const currentLearning = _.map(ownLearningList, ({ text }) => text)
    convo.setVar('currentLearning', currentLearning && currentLearning.length > 0 ? currentLearning.join(', ') : 'No one :thinking_face:')
    convo.setVar('learningList', learningList)
    convo.setVar('ownLearningList', ownLearningList)
    next()
  })

  convo.addMessage({
    text: `This is your current learning:`,
    attachments: [{
      'title': ':baby: Learning',
      'text': '{{{vars.currentLearning}}}',
      'color': '#FF5722'
    }]
  }, 'get_learning')

  convo.addMessage({
    text: `Your learning can help you to achieve your challenges! :fire:`,
    action: 'ask_learning'
  }, 'get_learning')

  convo.addQuestion({
    attachments: [{
      title: 'What do you want to do?',
      callback_id: 'ask_learning',
      attachment_type: 'default',
      actions: [
        {
          name: 'add_learning',
          text: 'Add a skill to learn',
          value: 'Add a skill to learn',
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
          text: 'Display my teachers',
          value: 'Display my teachers',
          type: 'button'
        },
        {
          name: nextThread,
          text: 'Do nothing',
          value: 'Do nothing',
          type: 'button'
        }
      ]
    }]
  }, function (reply, convo) {
    if (reply.callback_id === 'ask_learning') {
      convo.context.bot.replyInteractive(reply, {
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
    const { vars: { ownLearningList } } = convo
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

  convo.beforeThread('add_learning', (convo, next) => {
    const { learningList } = convo.vars
    const sifter = new Sifter(learningList)
    controller.optionsLoad['add_learning'] = (value) => {
      const results = sifter.search(value, {
        fields: ['text', 'value'],
        sort: [{ field: 'text', direction: 'asc' }],
        limit: 6
      })
      return _.map(results.items, ({ id }) => learningList[id])
    }
    next()
  })

  convo.addQuestion({
    attachments: [{
      title: 'Which learning do you want to add?',
      callback_id: 'add_learning',
      attachment_type: 'default',
      actions: [
        {
          name: 'saved',
          text: 'Choose a skill to learn',
          type: 'select',
          data_source: 'external',
          min_query_length: 1
        },
        {
          name: 'add_new_learning',
          text: 'Propose a new skill to learn',
          value: 'Propose a new skill to learn',
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
      const value = reply.actions[0].type === 'select' ? _.find(convo.vars.learningList, { value: reply.actions[0].selected_options[0].value }).text : reply.actions[0].value
      convo.context.bot.replyInteractive(reply, {
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
    const { context: { user }, vars: { ownLearningList, learningList } } = convo
    const learning = convo.extractResponse('learning')
    setNewLearning(user, learning)
      .then((learning) => {
        ownLearningList.push(learning)
        _.remove(learningList, l => _.isEqual(l, learning))
        ownLearningList.sort(sort)
        learningList.sort(sort)
        convo.setVar('learningList', learningList)
        convo.setVar('ownLearningList', ownLearningList)
        convo.setVar('learning', learning.text)
        next()
      })
      .catch((err) => {
        log('the `setNewLearning` method', err)
        convo.stop()
        next('stop')
      })
  })

  convo.beforeThread('remove_learning', (convo, next) => {
    const { ownLearningList } = convo.vars
    const sifter = new Sifter(ownLearningList)
    controller.optionsLoad['remove_learning'] = (value) => {
      const results = sifter.search(value, {
        fields: ['text', 'value'],
        sort: [{ field: 'text', direction: 'asc' }],
        limit: 6
      })
      return _.map(results.items, ({ id }) => ownLearningList[id])
    }
    next()
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
          data_source: 'external'
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
      const value = reply.actions[0].type === 'select' ? _.find(convo.vars.ownLearningList, { value: reply.actions[0].selected_options[0].value }).text : reply.actions[0].value
      convo.context.bot.replyInteractive(reply, {
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
    const { context: { user }, vars: { ownLearningList, learningList } } = convo
    const learning = convo.extractResponse('learning')
    removeLearning(user, learning)
      .then((learning) => {
        _.remove(ownLearningList, l => _.isEqual(l, learning))
        learningList.push(learning)
        ownLearningList.sort(sort)
        learningList.sort(sort)
        convo.setVar('learningList', learningList)
        convo.setVar('ownLearningList', ownLearningList)
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
}
