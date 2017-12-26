import _ from 'lodash'
import Promise from 'bluebird'

import { log } from '../../config'
import {
  getSkillsList, setNewSkill, getMemberWithSkills, removeSkill, sort, getLearningPeople
} from '../index'

export default (bot, message, introConvo) => Promise.all([getSkillsList(message.user), getMemberWithSkills(message.user)])
  .then(([skills, profile]) => bot.createPrivateConversation(message, (err, convo) => {
    if (err) log('the `add_new_skill` conversation', err)

    convo.setTimeout(1500000)

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
      }]
    }, 'default')

    convo.addMessage({
      text: `You can teach your skills to someone how want to learn! :sparkles:`,
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
            name: 'learning_people',
            text: 'Display learning people',
            value: 'Display learning people',
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

    convo.beforeThread('learning_people', (convo, next) => {
      Promise.all(_.map(ownSkillList, ({ text }) => getLearningPeople(text)
        .then(learningPeople => (learningPeople.length > 0 ? { skill: text, learningPeople } : null))))
        .then((res) => {
          const list = _.compact(res)
          if (ownSkillList.length === 0) {
            convo.gotoThread('no_skill')
          } else if (list.length === 0) {
            convo.gotoThread('no_people')
          } else {
            let text = ''
            list.forEach(({ skill, learningPeople }) => {
              if (learningPeople.length > 0) {
                text = text.concat(`*${skill}* can be teaching to `)
                learningPeople.forEach((id, index) => {
                  if (index === 0) {
                    text = text.concat(`<@${id}>`)
                  } else if (index + 1 === learningPeople.length) {
                    text = text.concat(` and <@${id}>`)
                  } else {
                    text = text.concat(`, <@${id}>`)
                  }
                })
                text = text.concat('\n')
              }
            })
            convo.setVar('learning_people', text)
          }
          next()
        })
        .catch((err) => {
          log('the `getLearningPeople` method', err)
          convo.stop()
          next('stop')
        })
    })

    convo.addMessage({
      text: `You don't have any skill to teach.`,
      action: 'ask_skill'
    }, 'no_skill')

    convo.addMessage({
      text: `There is no people to teach something to.`,
      action: 'ask_skill'
    }, 'no_people')

    convo.addMessage({
      text: `Here is the list of people that you can help to achieve their learning:`
    }, 'learning_people')

    convo.addMessage({
      text: '{{{vars.learning_people}}}'
    }, 'learning_people')

    convo.addMessage({
      text: `You just have to send a Slack message and propose a call or a lunch :facepunch:`,
      action: 'ask_skill'
    }, 'learning_people')

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
        .then(({ skill, learningRemoved }) => {
          ownSkillList.push(skill)
          _.remove(skillList, l => _.isEqual(l, skill))
          ownSkillList.sort(sort)
          skillList.sort(sort)
          convo.setVar('skill', skill.text)
          if (learningRemoved === true) {
            convo.gotoThread('learn_new_skill')
            next('stop')
          } else {
            next()
          }
        })
        .catch((err) => {
          log('the `setNewSkill` method', err)
          convo.stop()
          next('stop')
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
          convo.setVar('skill', skill.text)
          next()
        })
        .catch((err) => {
          log('the `removeSkill` method', err)
          convo.stop()
          next('stop')
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
      text: `Congratulation!! :tada: Your learning *{{{vars.skill}}}* is finally become a new skill! :clap::clap::clap:`
    }, 'learn_new_skill')

    convo.addMessage({
      text: `Don't forget to celebrate that! :cocktail:`,
      action: 'ask_skill'
    }, 'learn_new_skill')

    convo.addMessage({
      text: `Okay, next time!`
    }, 'exit')

    convo.addMessage('Hum... you seem busy. Come back say `skills` when you want!', 'on_timeout')

    convo.activate()
  }))
  .catch((err) => {
    const text = log('the `getSkillsList` or `getMemberWithSkills` method', err)
    introConvo.say(message, text)
  })
