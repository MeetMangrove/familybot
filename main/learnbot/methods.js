/* export const meetingDone = async (learner, teacher) => {
  const update = Promise.promisify(base(AIRTABLE_MOOD).update)
  const id = getPairingAirtableId(learner, teacher)
  await update(id, { 'Met': true })
}

export const saveFeedback = async (feedback, learner, teacher) => {
  const update = Promise.promisify(base(AIRTABLE_MOOD).update)
  const id = getPairingAirtableId(learner, teacher)
  await update(id, { 'Feedback': feedback })
}

// get applicant with Slack Username
export const getApplicant = async (slackHandle) => {
  const applicant = await _getAllRecords(base(AIRTABLE_APPLICANTS).select({
    maxRecords: 1,
    filterByFormula: `{Slack Username}='@${slackHandle}'`
  }))
  return applicant[0]
}

// update applicant with Slack Username
export const updateApplicant = async (slackHandle, obj) => {
  const update = Promise.promisify(base(AIRTABLE_APPLICANTS).update)
  const { id } = await getApplicant(slackHandle)
  const applicant = update(id, obj)
  return applicant
}

// reads all applicants from Airtable, and returns them as an Array of
// {name: String,
// interests: [String],
// skills: [String]}

export const getAllApplicants = async () => {
  const records = await _getAllRecords(base(AIRTABLE_APPLICANTS).select({
    view: 'Main View',
    fields: ['Slack Username', 'Interests', 'Skills', 'Admin', 'Applicant'],
    filterByFormula: '{Inactive}=0'
  }))
  return _.reduce(records, (people, r) => {
    const name = (r.get('Slack Username') || [])[0]
    if (name && name.length) {
      people.push({
        name: name.replace(/^@/, ''),
        interests: (r.get('Interests') || []),
        skills: (r.get('Skills') || []),
        isAdmin: !!r.get('Admin'),
        applicant: (r.get('Applicant') || [])[0]
      })
    }
    return people
  }, [])
}

// reads all members from Slack, and returns them as an Array of
// {name: String,
// id: String}

export const getAllNoApplicants = async (bot) => {
  const apiUser = Promise.promisifyAll(bot.api.users)
  const { members } = await apiUser.listAsync({ token: bot.config.bot.app_token })
  const applicants = await getAllApplicants()
  const listMember = _.map(members, ({ id, name }) => ({ id, name }))
  const listApplicants = _.map(applicants, ({ name }) => name)
  _.remove(listMember, ({ name }) => listApplicants.indexOf(name) >= 0)
  return listMember
}

export const checkIfFirstTime = async (bot, message) => {
  const { name } = await getSlackUser(bot, message.user)
  const applicant = await getApplicant(name)
  if (!!applicant === false) {
    await firstTimeConversation(bot, message, { name })
  }
  return !!applicant
}

// reads all admins applicants from Airtable, and returns
// a boolean checking if the current user is an admin or not.
export const checkIfAdmin = async (bot, message) => {
  const admins = []
  const apiUser = Promise.promisifyAll(bot.api.users)
  const records = await _getAllRecords(base(AIRTABLE_APPLICANTS).select({
    view: 'Main View',
    filterByFormula: '{Admin}=1'
  }))
  records.forEach((record) => {
    const name = record.get('Slack Username')[0]
    admins.push(name.replace(/^@/, ''))
  })
  const { user: { name } } = await apiUser.infoAsync({ user: message.user })
  return admins.indexOf(name) >= 0
}

// reads all pairing from Airtable, and returns them as an Array of
// {name: String,
// isLearner: Boolean,
// teacherName: String,
// learning: String,
// isTeacher: Boolean,
// learnerName: String,
// teaching: String}

export const getMembersPaired = async () => {
  const applicants = await getAllApplicants()
  const members = _.map(applicants, ({ name }) => ({ name, isLearner: false, isTeacher: false }))
  const pairings = await getPairingsNotIntroduced()
  pairings.forEach((record) => {
    const learner = record.get('Learner')
    const teacher = record.get('Teacher')
    const skills = record.get('Skill')
    const index = _.random(skills.length - 1)
    const skill = skills[index]
    const indexLearner = _.findIndex(members, e => e.name === learner)
    const indexTeacher = _.findIndex(members, e => e.name === teacher)
    members[indexLearner].isLearner = true
    members[indexLearner].teacherName = teacher
    members[indexLearner].learning = skill
    members[indexTeacher].isTeacher = true
    members[indexTeacher].learnerName = learner
    members[indexTeacher].teaching = skill
  })
  return members
}

export const getPairingsNotIntroduced = async () => {
  const pairings = await _getAllRecords(base(AIRTABLE_PAIRING).select({
    view: 'Main View',
    filterByFormula: '{Introduced}=0'
  }))
  return pairings
}

// reads a Pairing from Airtable
export const getPairing = async (tableName, pairingId) => {
  const pairingRecords = await _getAllRecords(base(tableName).select({
    view: 'Main View',
    fields: ['Teacher', 'Learner', 'Skill', 'Paired On'],
    filterByFormula: `{Pairing Id}='${pairingId}'`
  }))
  let createdAt = pairingRecords.length && pairingRecords[0].get('Paired On')
  return {
    id: pairingId,
    createdAt: createdAt && createdAt + 'T00:00:00Z',
    pairs: _.map(pairingRecords, (r) => {
      return {
        teacherName: r.get('Teacher'),
        learnerName: r.get('Learner'),
        skills: r.get('Skill')
      }
    })
  }
}

// saves a Pairing to Airtable
export const savePairing = async (tableName, pairing) => {
  // ensure we have the proper structure
  if (!pairing.id) return console.log('missing pairing.id')
  if (!_.isArray(pairing.pairs)) return console.log('invalid pairing.pairs')
  // write the pairs to Airtable
  const create = Promise.promisify(base(tableName).create)
  await Promise.map(pairing.pairs, (pair) => {
    return create({
      'Pairing Id': pairing.id,
      'Paired On': pairing.createdAt.substr(0, 10),
      'Teacher': pair.teacherName,
      'Learner': pair.learnerName,
      'Skill': pair.skills
    })
  })
  return pairing
}

// removes a Pairing from Airtable
export const destroyPairing = async (tableName, pairingId) => {
  const pairingRecords = await _getAllRecords(base(tableName).select({
    view: 'Main View',
    fields: [],
    filterByFormula: `{Pairing Id}='${pairingId}'`
  }))
  const destroy = Promise.promisify(base(tableName).destroy)
  await Promise.map(pairingRecords, (record) => {
    return destroy(record.getId())
  })
  return pairingId
}

export const getPairingAirtableId = async (learner, teacher) => {
  const pairingRecords = await _getAllRecords(base('Pairings').select({
    view: 'Main View',
    filterByFormula: `{Teacher}='${teacher} && {Learner}='${learner} '`
  }))
  console.log(pairingRecords)
} */
