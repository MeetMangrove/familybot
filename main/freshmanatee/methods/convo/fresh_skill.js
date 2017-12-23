import _ from 'lodash'
import Promise from 'bluebird'

import { log } from '../../config'
import { getSkillsList, setNewSkill, getMemberWithSkills, removeSkill, sort } from '../index'

export default (bot, message, introConvo) => Promise.all([getSkillsList(message.user), getMemberWithSkills(message.user)])
  .then(([skills, profile]) => bot.createPrivateConversation(message, (err, convo) => {
    if (err) log('the `add_new_skill` conversation', err)

    convo.setTimeout(1800000)

    let skillList = skills
    let ownSkillList = profile.get('Skills')
    skillList.sort(sort)
    ownSkillList.sort(sort)
    const currentSkill = _.map(ownSkillList, ({ text }) => text)
    convo.setVar('currentSkills', currentSkill && currentSkill.length > 0 ? currentSkill.join(', ') : 'No one for the moment :stuck_out_tongue:')

    convo.addMessage({
      text: `This is your current skills:`,
      attachments: [{
        'title': ':muscle: Skills',
        'text': '{{{vars.currentSkills}}}',
        'color': '#FF9800'
      }],
      action: 'ask_skill'
    }, 'default')

    convo.addQuestion({
      attachments: [{
        title: 'What do you want to do?',
        callback_id: 'ask_skill',
        attachment_type: 'default',
        actions: [
          {
            name: 'add_skill',
            text: 'Add a skill',
            value: 'Add a skill',
            type: 'button',
            style: 'primary'
          },
          {
            name: 'remove_skill',
            text: 'Remove a skill',
            value: 'Remove a skill',
            type: 'button',
            style: 'danger'
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
      if (reply.callback_id === 'ask_skill') {
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
    }, {}, 'ask_skill')

    convo.addQuestion({
      attachments: [{
        title: 'What is your new skill?',
        callback_id: 'add_skill',
        attachment_type: 'default',
        actions: [
          {
            name: 'saved',
            text: 'Choose a skill',
            type: 'select',
            options: skillList
          },
          {
            name: 'add_new_skill',
            text: 'Propose a new skill',
            value: 'Propose a new skill',
            type: 'button',
            style: 'primary'
          },
          {
            name: 'ask_skill',
            text: 'Any, go back',
            value: 'Any, go back',
            type: 'button'
          }
        ]
      }]
    }, function (reply, convo) {
      if (reply.callback_id === 'add_skill') {
        const value = reply.actions[0].type === 'select' ? _.find(skillList, { value: reply.actions[0].selected_options[0].value }).text : reply.actions[0].value
        bot.replyInteractive(reply, {
          attachments: [
            {
              title: 'What is your new skill?',
              text: `_${value}_`,
              mrkdwn_in: ['text']
            }
          ]
        })
        convo.gotoThread(reply.actions[0].name)
        convo.next()
      }
    }, { key: 'skill' }, 'add_skill')

    convo.addQuestion({
      text: `What is the name of this new skill?`
    }, (response, convo) => {
      convo.gotoThread('saved')
    }, { key: 'skill' }, 'add_new_skill')

    convo.beforeThread('saved', (convo, next) => {
      const skill = convo.extractResponse('skill')
      setNewSkill(message.user, skill)
        .then((skill) => {
          ownSkillList.push(skill)
          _.remove(skillList, l => _.isEqual(l, skill))
          ownSkillList.sort(sort)
          skillList.sort(sort)
          convo.setVar('skill', skill.text)
          next()
        })
        .catch((err) => {
          const text = log('the `setNewSkill` method', err)
          convo.say(text)
          convo.stop()
        })
    })

    convo.addQuestion({
      attachments: [{
        title: 'Which skill do you want to remove?',
        callback_id: 'remove_skill',
        attachment_type: 'default',
        actions: [
          {
            name: 'removed',
            text: 'Choose a skill',
            type: 'select',
            options: ownSkillList
          },
          {
            name: 'ask_skill',
            text: 'Any, go back',
            value: 'Any, go back',
            type: 'button'
          }
        ]
      }]
    }, function (reply, convo) {
      if (reply.callback_id === 'remove_skill') {
        const value = reply.actions[0].type === 'select' ? _.find(ownSkillList, { value: reply.actions[0].selected_options[0].value }).text : reply.actions[0].value
        bot.replyInteractive(reply, {
          attachments: [
            {
              title: 'Which skill do you want to remove?',
              text: `_${value}_`,
              mrkdwn_in: ['text']
            }
          ]
        })
        convo.gotoThread(reply.actions[0].name)
        convo.next()
      }
    }, { key: 'skill' }, 'remove_skill')

    convo.beforeThread('removed', (convo, next) => {
      const skill = convo.extractResponse('skill')
      removeSkill(message.user, skill)
        .then((skill) => {
          _.remove(ownSkillList, l => _.isEqual(l, skill))
          skillList.push(skill)
          ownSkillList.sort(sort)
          skillList.sort(sort)
          convo.setVar('learning', skill.text)
          next()
        })
        .catch((err) => {
          const text = log('the `removeSkill` method', err)
          convo.say(text)
          convo.stop()
        })
    })

    convo.addMessage({
      text: `Awesome, your new skill *{{{vars.skill}}}* has been successfully saved! :rocket:`,
      action: 'ask_skill'
    }, 'saved')

    convo.addMessage({
      text: `Your skill *{{{vars.skill}}}* has been successfully removed!`,
      action: 'ask_skill'
    }, 'removed')

    convo.addMessage({
      text: `Okay, next time!`
    }, 'exit')

    convo.onTimeout(function (convo) {
      convo.say('Hum... you seem busy. Come back say `skills` when you want!')
      convo.stop()
    })

    convo.activate()
  }))
  .catch((err) => {
    const text = log('the `getSkillsList` or `getMemberWithSkills` method', err)
    introConvo.say(message, text)
  })
