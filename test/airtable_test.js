/* eslint-disable no-unused-expressions */

import 'babel-polyfill'
import _ from 'lodash'
import { expect } from './helper'
import { getAllApplicants, getPairing, savePairing, destroyPairing } from '../main/methods'

const PAIRINGS_TABLE = 'Pairings'
const SKILLS = ['Node.js', 'UX Design']

function _expectValidPairing (pairing) {
  expect(pairing).to.be.an('object')
  expect(pairing.pairs).to.be.an('array')
  expect(pairing.createdAt).to.be.a('string')
  expect(pairing.createdAt).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/)
  _.each(pairing.pairs, (pair) => {
    expect(pair).to.be.an('object')
    expect(pair.teacherName).to.be.a('string')
    expect(pair.teacherName).not.to.be.empty
    expect(pair.learnerName).to.be.a('string')
    expect(pair.learnerName).not.to.be.empty
    expect(pair.skills).to.be.an('array')
    expect(pair.skills).not.to.be.empty
  })
}

describe('airtable', function () {
  describe('.getAllPeople with the \'P2PL Applicants\' table', function () {
    it('retrieves people, skills and interests', async () => {
      const people = await getAllApplicants()
      expect(people).to.be.an('array')
      expect(people).not.to.be.empty
      people.forEach(function (person) {
        expect(person).to.be.an('object')
        expect(_.keys(person)).to.have.members(['name', 'interests', 'skills', 'isAdmin', 'applicant'])
        expect(person.name).to.be.a('string')
        expect(person.name).not.to.be.empty
        expect(person.interests).to.be.a('array')
        expect(person.skills).to.be.a('array')
        person.interests.forEach(function (i) {
          expect(i).to.be.a('string')
        })
        person.skills.forEach(function (i) {
          expect(i).to.be.a('string')
        })
        expect(person.isAdmin).to.be.a('boolean')
      })
    })
  })

  describe('.getPairing', function () {
    // Must be the same that at least one of existing pairings
    const pairingId = 'test_201704170001'

    it('returns an existing pairing', async () => {
      const pairing = await getPairing(PAIRINGS_TABLE, pairingId)
      expect(pairing.id).to.eq(pairingId)
      _expectValidPairing(pairing)
    })
  })

  describe('.savePairing and .destroyPairing', function () {
    const pairingId = `test_${new Date().toISOString()}`

    it('saves, reads, and destroys a pairing', async () => {
      const pairing = {
        id: pairingId,
        createdAt: new Date().toISOString(),
        pairs: [
          {
            teacherName: 'test1',
            learnerName: 'test2',
            skills: _.sampleSize(SKILLS, 2)
          }
        ]
      }
      const newPairing = await savePairing(PAIRINGS_TABLE, pairing)
      expect(newPairing.id).to.eq(pairingId)
      // try to read back the pairing
      const readPairing = await getPairing(PAIRINGS_TABLE, pairingId)
      _expectValidPairing(readPairing)
      // assert the pairing was properly created
      expect(readPairing.id).to.eq(pairingId)
      expect(readPairing.pairs.length).to.eq(pairing.pairs.length)
      _.each(readPairing.pairs, (readPair, i) => {
        const pair = pairing.pairs[i]
        expect(readPair.teacherName).to.eq(pair.teacherName)
        expect(readPair.learnerName).to.eq(pair.learnerName)
      })
      // try to destroy the pairing
      const destroyedPairingId = await destroyPairing(PAIRINGS_TABLE, pairingId)
      expect(destroyedPairingId).to.eq(pairingId)
    })
  })
})
