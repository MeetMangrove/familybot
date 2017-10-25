/**
 * Created by thomasjeanneau on 30/05/2017.
 */

import { saveProfile } from '../methods'
import { profile } from './askForUpdate'

export default ({ bot, message }) => {
  try {
    const dialog = bot
      .createDialog(
        'Fresh your profile',
        'fresh_profile',
        'Fresh')
      .addTextarea('Bio', 'bio', profile.get('Bio'), {
        max_length: 500,
        placeholder: 'What are your current projects? What made you happy recently (outside of projects)?'
      })
      .addText('Location', 'location', profile.get('Location'))
      .addTextarea('Focus', 'focus', profile.get('Focus'), {
        max_length: 300,
        placeholder: 'Your main focus for the next two weeks? (private)'
      })
      .addTextarea('Challenges', 'challenges', profile.get('Challenges'), {
        max_length: 300,
        placeholder: 'What challenges do you currently face in your projects and life? (private)'
      })
    bot.replyWithDialog(message, dialog.asObject(), async (err, newProfile) => {
      if (err) return console.log(err)
      await saveProfile(profile, newProfile)
    })
  } catch (e) {
    console.log(e)
    bot.reply(message, `Oops..! :sweat_smile: A little error occur: \`${e.message || e.error || e}\``)
  }
}
