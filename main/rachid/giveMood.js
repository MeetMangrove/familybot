import _ from 'lodash'

import {
  getIdFromName,
  saveMood,
} from '../methods'

export default (convo, name) => {
  convo.addQuestion({
    text: `What is your mood today on a scale from 1 to 10?`
  }, (response, convo) => {
    const mood = _.find([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], n => n === parseInt(response.text, 10))
    if (mood) {
      convo.gotoThread('comments')
    } else {
      convo.addMessage({
        text: `Hum... :thinking_face:`
      }, 'give_mood')
      convo.addMessage({
        text: `This is not a validate mood, please try again :pray:`
      }, 'give_mood')
      convo.repeat()
    }
    convo.next()
  }, { key: 'level' }, 'give_mood')

  convo.addMessage({
    text: `Thanks for giving me your mood! :fire:`
  }, 'comments')

  convo.addQuestion({
    text: `If you want to add your status as well, please share it below. Otherwise, just say \`no\` to save your answer.`
  }, (response, convo) => {
    convo.gotoThread('saved')
    convo.next()
  }, { key: 'comment' }, 'comments')

  convo.beforeThread('saved', async function (convo, next) {
    const id = await getIdFromName(name)
    const level = convo.extractResponse('level')
    const comment = convo.extractResponse('comment')
    await saveMood(id, level, comment)
    next()
  })

  convo.addMessage({
    text: `Awesome, it has been successfully saved!`
  }, 'saved')

  convo.addMessage({
    text: `See you tomorrow, take care :heart:`
  }, 'saved')
}
