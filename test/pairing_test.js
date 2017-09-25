/* eslint-disable no-unused-expressions */

import 'babel-polyfill'
import _ from 'lodash'
import { expect } from './helper'
import { generatePairing } from '../main/learnbot/pairing'

// helpers to inspect a pairing
function _pairingSize (pairing) {
  return pairing.pairs.length
}
function _pairingTeachers (pairing) {
  return _.orderBy(_.map(pairing.pairs, 'teacherName'))
}
function _pairingLearners (pairing) {
  return _.orderBy(_.map(pairing.pairs, 'learnerName'))
}

describe('.generatePairing', function () {
  context('with 2 people with mutual skills/interests', function () {
    beforeEach(function () {
      this.people = [
        {name: 'alice', skills: ['js'], interests: ['ruby']},
        {name: 'bob', skills: ['ruby'], interests: ['js']}
      ]
    })

    it('works', async function () {
      const pairing = await generatePairing(this.people)
      expect(pairing.id).to.be.a('string')
      expect(pairing.isComplete).to.be.true
      expect(_pairingSize(pairing)).to.eq(2)
      expect(_pairingTeachers(pairing)).to.eql(['alice', 'bob'])
      expect(_pairingLearners(pairing)).to.eql(['alice', 'bob'])
    })
  })

  context('when one person can\'t be paired', function () {
    beforeEach(function () {
      this.people = [
        {name: 'alice', skills: ['js'], interests: ['ruby']},
        // charlie and bob interested in js, only one can learn
        {name: 'bob', skills: ['ruby'], interests: ['js']},
        {name: 'charlie', skills: ['c++'], interests: ['js']}
      ]
    })

    it('results in an incomplete pairing', async function () {
      const pairing = await generatePairing(this.people)
      expect(pairing.id).to.be.a('string')
      expect(pairing.isComplete).to.be.false
      // expect 2 pairs
      expect(_pairingSize(pairing)).to.eq(2)
      // expect alice to be both a learner and a teacher
      expect(_pairingTeachers(pairing)).to.include('alice')
      expect(_pairingLearners(pairing)).to.include('alice')
    })
  })
})
