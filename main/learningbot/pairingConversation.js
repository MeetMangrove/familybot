/**
 * Created by thomasjeanneau on 20/03/2017.
 */

import _ from 'lodash'
import Promise from 'bluebird'
import asyncForEach from 'async-foreach'

import { base } from '../airtable/index'
import { getPairingsNotIntroduced } from '../methods'

const {AIRTABLE_PAIRING} = process.env
const {forEach} = asyncForEach

export default async (bot, message, membersPaired) => {
  const apiUser = Promise.promisifyAll(bot.api.users)
  const apiGroups = Promise.promisifyAll(bot.api.groups)
  const airtableUpdate = Promise.promisify(base(AIRTABLE_PAIRING).update)
  const botSay = Promise.promisify(bot.say)
  const token = bot.config.bot.app_token
  const {members} = await apiUser.listAsync({token})
  const list = _.map(members, member => _.pick(member, ['id', 'name']))
  const pairingsNotIntroduced = await getPairingsNotIntroduced()
  forEach(pairingsNotIntroduced, async function (pairing) {
    const done = this.async()
    const teacher = _.find(list, ['name', pairing.get('Teacher')])
    const learner = _.find(list, ['name', pairing.get('Learner')])
    const indexTeacher = _.findIndex(membersPaired, e => e.name === teacher.name)
    const skill = membersPaired[indexTeacher].teaching
    const {groups} = await apiGroups.listAsync({token})
    const groupName = `p2pl_${pairing.get('Id')}`
    const group = _.find(groups, ['name', groupName])
    let groupId
    if (group) {
      groupId = group.id
      if (group.is_archived === true) await apiGroups.unarchiveAsync({token, channel: groupId})
    } else {
      const groupsCreate = await apiGroups.createAsync({token, name: groupName})
      groupId = groupsCreate.group.id
    }
    if (teacher.id !== message.user) {
      await apiGroups.inviteAsync({
        token,
        channel: groupId,
        user: teacher.id
      })
    }

    if (learner.id !== message.user) {
      await apiGroups.inviteAsync({
        token,
        channel: groupId,
        user: learner.id
      })
    }
    await apiGroups.inviteAsync({token, channel: groupId, user: bot.identifyBot().id})
    await airtableUpdate(pairing.id, {'Introduced': true})
    await botSay({
      text: `Hey guys! I've paired you this month :smile:\n<@${teacher.name}>: <@${learner.name}> would like to know more about *${skill}*. I'm sure you have a lot to share!\nI let you two arrange a meeting together, let me know about the date :blush:.`,
      channel: groupId
    })
    if (learner.id !== message.user && teacher.id !== message.user) {
      await apiGroups.leaveAsync({
        token,
        channel: groupId
      })
    }
    done()
  })
}
