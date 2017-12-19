import _ from 'lodash'

import { getSkillsList } from './methods'

export default ({ bot, convo, slackId }) => {
  const timeout = setTimeout((bot, channel, convo) => {
    bot.say({ text: 'Hum... you seem busy. Come back say `fresh` when you want!', channel })
    convo.stop()
  }, 1800000, bot, slackId, convo)

  convo.beforeThread('search', async (convo, next) => {
    const skills = await getSkillsList()
    convo.setVar('list', { skills })
    next()
  })

  convo.addQuestion({
    response_type: 'in_channel',
    attachments: [{
      title: 'What is your new skill?',
      callback_id: 'new_skill',
      attachment_type: 'default',
      actions: [
        {
          name: 'new_skill',
          text: 'Choose a new skill...',
          type: 'select',
          options: convo.vars.list.skills
        },
        {
          name: 'add_skill',
          text: 'Add a skill that doesn\'t exist yet',
          value: 'add_skill',
          type: 'button',
          style: 'primary'
        },
        {
          name: 'exit',
          text: 'Not today',
          value: 'exit',
          type: 'button'
        }
      ]
    }]
  }, function (reply, convo) {
    if (reply.callback_id === 'update_info') {
      clearTimeout(timeout)
      if (reply.actions[0].value === 'yes') {

      }
    }
  })
}
