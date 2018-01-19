import { log } from '../../config'

export default (bot, message) => bot.createPrivateConversation(message, (err, convo) => {
  if (err) log('the `add_new_skill` conversation', err)

  convo.setTimeout(1500000)

  convo.addQuestion({
    attachments: [{
      title: 'About which command can I help you?',
      callback_id: 'command',
      attachment_type: 'default',
      actions: [
        {
          name: 'fresh',
          text: 'Fresh',
          value: 'Fresh',
          type: 'button'
        },
        {
          name: 'skills',
          text: 'Skills',
          value: 'Skills',
          type: 'button'
        },
        {
          name: 'learning',
          text: 'Learning',
          value: 'Learning',
          type: 'button'
        },
        {
          name: 'mangrovers',
          text: 'Mangrovers',
          value: 'Mangrovers',
          type: 'button'
        },
        {
          name: 'exit',
          text: 'No one, thanks!',
          value: 'No one, thanks!',
          type: 'button'
        }
      ]
    }]
  }, function (reply, convo) {
    if (reply.callback_id === 'command') {
      bot.replyInteractive(reply, {
        attachments: [{
          title: 'About which command can I help you?',
          text: `_${reply.actions[0].value}_`,
          mrkdwn_in: ['text']
        }]
      })
      convo.gotoThread(reply.actions[0].name)
      convo.next()
    }
  }, {}, 'default')

  convo.addMessage(`Say \`fresh\` if you want me to share your latest news, goals and challenges!`, 'fresh')
  convo.addMessage(`One goal of Mangrove is helping you to resolve your challenges,`, 'fresh')
  convo.addMessage(`this command allowed you to share your challenges according to your focus.`, 'fresh')
  convo.addMessage(`This will be displayed in <#C0KD37VUP> every wednesday at 6PM Paris time :rocket:`, 'fresh')
  convo.addMessage({
    text: `The <!subteam^S7WBYB6TZ|catalysts> team will help you to resolve them thanks to what you have shared :mangrove:`,
    action: 'default'
  }, 'fresh')

  convo.addMessage(`Say \`skills\` to manage your skills!`, 'skills')
  convo.addMessage(`We consider that a valuable skill is a skill that you can teach and feel legitimate about,`, 'skills')
  convo.addMessage(`I mean something that you can talk about to another Mangrover, answer to questions about`, 'skills')
  convo.addMessage(`and give well building feedback on projects linked to this skill.`, 'skills')
  convo.addMessage(`With this command, you can \`add a skill\` or \`remove a skill\` of your Mangrover's profile.`, 'skills')
  convo.addMessage(`We have a base list of Mangrovers skills, but you can \`propose a new skill\` to update this list and then list your skills easier.`, 'skills')
  convo.addMessage(`You can also \`display my learners\` to see Mangrovers who are learning your skills!`, 'skills')
  convo.addMessage({
    text: `It's now simple to see which people you can help in their learning, and so in their challenges achievement :wink:`,
    action: 'default'
  }, 'skills')

  convo.addMessage(`Say \`learning\` to manage your learning!`, 'learning')
  convo.addMessage(`Learning are more impactful when their are directly linked to your challenges,`, 'learning')
  convo.addMessage(`try to learn something that can help you to achieve one of your challenges.`, 'learning')
  convo.addMessage(`With this command, you can \`add a learning\` or \`remove a learning\` of your Mangrover's profile.`, 'learning')
  convo.addMessage(`We have a base list of Mangrovers skills, but you can \`propose a new skill to learn\` to update this list and then list your learning easier.`, 'learning')
  convo.addMessage({
    text: `You can also \`display my teachers\` to see Mangrovers who can help you to achieve your learning! :raised_hands:`,
    action: 'default'
  }, 'learning')

  convo.addMessage(`Say \`mangrovers\` to get the link of Mangrovers' profiles!`, 'mangrovers')
  convo.addMessage(`You will see all information you want to know about Mangrovers,`, 'mangrovers')
  convo.addMessage(`like numbers of done and thanks, status, tracks,`, 'mangrovers')
  convo.addMessage(`also their current focus, challenges and learning`, 'mangrovers')
  convo.addMessage(`in addition to their location and skills.`, 'mangrovers')
  convo.addMessage({
    text: `This is our Mangrove Pokedex :man-woman-girl-boy::heart:`,
    action: 'default'
  }, 'mangrovers')

  convo.addMessage(`Okay, I wish I would have been helpful! :hugging_face:`, 'exit')

  convo.addMessage('Hum... you seem busy. Come back say `help` when you want!', 'on_timeout')

  convo.activate()
})
