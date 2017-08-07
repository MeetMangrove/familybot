'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUsersAskedByResponsible = exports.getTimestamp = exports.getResponsibles = exports.checkIfResponsible = exports.getRandomMembers = exports.getAvailableMembers = exports.updateMember = exports.destroyPairing = exports.savePairing = exports.getPairing = exports.getPairingsNotIntroduced = exports.getMembersPaired = exports.checkIfAdmin = exports.checkIfFirstTime = exports.getAllNoApplicants = exports.getAllApplicants = exports.updateApplicant = exports.getApplicant = exports.getColor = exports.getEmoji = exports.getMoods = exports.saveMood = exports.getIdFromName = exports.getAllMembers = exports.checkIfBot = exports.getMember = exports.getSlackUser = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _asyncForeach = require('async-foreach');

var _asyncForeach2 = _interopRequireDefault(_asyncForeach);

var _airtable = require('./airtable');

var _firstTimeConversation = require('./learningbot/firstTimeConversation');

var _firstTimeConversation2 = _interopRequireDefault(_firstTimeConversation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Created by thomasjeanneau on 20/03/2017.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  */

var forEach = _asyncForeach2.default.forEach;
var _process$env = process.env,
    AIRTABLE_MEMBERS = _process$env.AIRTABLE_MEMBERS,
    AIRTABLE_MOOD = _process$env.AIRTABLE_MOOD,
    AIRTABLE_APPLICANTS = _process$env.AIRTABLE_APPLICANTS,
    AIRTABLE_PAIRING = _process$env.AIRTABLE_PAIRING;


if (!AIRTABLE_MEMBERS && !AIRTABLE_APPLICANTS && !AIRTABLE_PAIRING) {
  console.log('Error: Specify AIRTABLE_MEMBERS, AIRTABLE_APPLICANTS and AIRTABLE_PAIRING in a .env file');
  process.exit(1);
}

// get slack user info by id
var getSlackUser = exports.getSlackUser = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(bot, id) {
    var apiUser, _ref2, user;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            apiUser = _bluebird2.default.promisifyAll(bot.api.users);
            _context.next = 3;
            return apiUser.infoAsync({ user: id });

          case 3:
            _ref2 = _context.sent;
            user = _ref2.user;
            return _context.abrupt('return', user);

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function getSlackUser(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

// get member by id
var getMember = exports.getMember = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(id) {
    var findMember, member;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            findMember = _bluebird2.default.promisify((0, _airtable.base)(AIRTABLE_MEMBERS).find);
            _context2.next = 3;
            return findMember(id);

          case 3:
            member = _context2.sent;
            return _context2.abrupt('return', member);

          case 5:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function getMember(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

// check if the id is one of a bot
var checkIfBot = exports.checkIfBot = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(bot, id) {
    var apiUsers, _ref5, isBot;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!(id === 'USLACKBOT')) {
              _context3.next = 2;
              break;
            }

            return _context3.abrupt('return', true);

          case 2:
            apiUsers = _bluebird2.default.promisifyAll(bot.api.users);
            _context3.next = 5;
            return apiUsers.infoAsync({ token: bot.config.bot.app_token, user: id });

          case 5:
            _ref5 = _context3.sent;
            isBot = _ref5.user.is_bot;
            return _context3.abrupt('return', isBot);

          case 8:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function checkIfBot(_x4, _x5) {
    return _ref4.apply(this, arguments);
  };
}();

// get all slack members
var getAllMembers = exports.getAllMembers = function () {
  var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(bot) {
    var apiUser, _ref7, members;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            apiUser = _bluebird2.default.promisifyAll(bot.api.users);
            _context4.next = 3;
            return apiUser.listAsync({ token: bot.config.bot.app_token });

          case 3:
            _ref7 = _context4.sent;
            members = _ref7.members;

            _lodash2.default.remove(members, function (_ref8) {
              var id = _ref8.id;
              return checkIfBot(bot, id) === true;
            });
            return _context4.abrupt('return', members);

          case 7:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function getAllMembers(_x6) {
    return _ref6.apply(this, arguments);
  };
}();

var getIdFromName = exports.getIdFromName = function () {
  var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(name) {
    var records;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _airtable._getAllRecords)((0, _airtable.base)(AIRTABLE_MEMBERS).select({
              view: 'Main View',
              filterByFormula: '{Slack Handle} = \'@' + name + '\''
            }));

          case 2:
            records = _context5.sent;
            return _context5.abrupt('return', records[0].id);

          case 4:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function getIdFromName(_x7) {
    return _ref9.apply(this, arguments);
  };
}();

var saveMood = exports.saveMood = function () {
  var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(id, level, comment) {
    var create;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            create = _bluebird2.default.promisify((0, _airtable.base)(AIRTABLE_MOOD).create);
            _context6.next = 3;
            return create({
              'Member': [id],
              'Level': parseInt(level, 10),
              'Comment': /^\s*no+\s*$/i.test(comment) ? '' : comment,
              'Date': Date.now()
            });

          case 3:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined);
  }));

  return function saveMood(_x8, _x9, _x10) {
    return _ref10.apply(this, arguments);
  };
}();

var getMoods = exports.getMoods = function () {
  var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
    var ping, records, list, moods, i, exist, j;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            ping = Date.now() - 86400000;
            _context7.next = 3;
            return (0, _airtable._getAllRecords)((0, _airtable.base)(AIRTABLE_MOOD).select({
              view: 'Recent, by member',
              filterByFormula: '{Date} >= ' + ping
            }));

          case 3:
            records = _context7.sent;
            list = _lodash2.default.map(records, function (r) {
              return r.fields;
            });
            moods = [];

            for (i = 0; i < list.length; i += 1) {
              exist = false;

              for (j = 0; j < moods.length; j += 1) {
                if (list[i]['Member'][0] === moods[j]['Member'][0]) {
                  exist = true;
                  if (list[i]['Date'] >= moods[j]['Date']) {
                    moods[j] = list[i];
                  }
                }
              }
              if (!exist) moods.push(list[i]);
            }
            return _context7.abrupt('return', moods);

          case 8:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined);
  }));

  return function getMoods() {
    return _ref11.apply(this, arguments);
  };
}();

var getEmoji = exports.getEmoji = function getEmoji(level) {
  switch (level) {
    case 1:
    case 2:
    case 3:
      {
        return ':sos:';
      }
    case 4:
    case 5:
    case 6:
      {
        return ':warning:';
      }
    case 7:
      {
        return ':slightly_smiling_face:';
      }
    case 8:
      {
        return ':simple_smile:';
      }
    case 9:
      {
        return ':smile:';
      }
    case 10:
      {
        return ':sunglasses:';
      }
    default:
      {
        return ':simple_smile: ';
      }
  }
};

var getColor = exports.getColor = function getColor(level) {
  switch (level) {
    case 1:
      return '#B71C1C';
    case 2:
      return '#D32F2F';
    case 3:
      return '#F44336';
    case 4:
      return '#F57F17';
    case 5:
      return '#FBC02D';
    case 6:
      return '#FFEB3B';
    case 7:
      return '#CDDC39';
    case 8:
      return '#9CCC65';
    case 9:
      return '#7CB342';
    case 10:
      return '#558B2F';
    default:
      return '#9CCC65';
  }
};

// get applicant with slack handle
var getApplicant = exports.getApplicant = function () {
  var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(slackHandle) {
    var applicant;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return (0, _airtable._getAllRecords)((0, _airtable.base)(AIRTABLE_APPLICANTS).select({
              maxRecords: 1,
              filterByFormula: '{Slack Handle}=\'@' + slackHandle + '\''
            }));

          case 2:
            applicant = _context8.sent;
            return _context8.abrupt('return', applicant[0]);

          case 4:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, undefined);
  }));

  return function getApplicant(_x11) {
    return _ref12.apply(this, arguments);
  };
}();

// update applicant with slack handle
var updateApplicant = exports.updateApplicant = function () {
  var _ref13 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(slackHandle, obj) {
    var update, _ref14, id, applicant;

    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            update = _bluebird2.default.promisify((0, _airtable.base)(AIRTABLE_APPLICANTS).update);
            _context9.next = 3;
            return getApplicant(slackHandle);

          case 3:
            _ref14 = _context9.sent;
            id = _ref14.id;
            applicant = update(id, obj);
            return _context9.abrupt('return', applicant);

          case 7:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, undefined);
  }));

  return function updateApplicant(_x12, _x13) {
    return _ref13.apply(this, arguments);
  };
}();

/* reads all applicants from Airtable, and returns them as an Array of
 {name: String,
 interests: [String],
 skills: [String]}
 */
var getAllApplicants = exports.getAllApplicants = function () {
  var _ref15 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10() {
    var records;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return (0, _airtable._getAllRecords)((0, _airtable.base)(AIRTABLE_APPLICANTS).select({
              view: 'Main View',
              fields: ['Slack Handle', 'Interests', 'Skills', 'Admin', 'Applicant'],
              filterByFormula: '{Inactive}=0'
            }));

          case 2:
            records = _context10.sent;
            return _context10.abrupt('return', _lodash2.default.reduce(records, function (people, r) {
              var name = (r.get('Slack Handle') || [])[0];
              if (name && name.length) {
                people.push({
                  name: name.replace(/^@/, ''),
                  interests: r.get('Interests') || [],
                  skills: r.get('Skills') || [],
                  isAdmin: !!r.get('Admin'),
                  applicant: (r.get('Applicant') || [])[0]
                });
              }
              return people;
            }, []));

          case 4:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, undefined);
  }));

  return function getAllApplicants() {
    return _ref15.apply(this, arguments);
  };
}();

/* reads all members from Slack, and returns them as an Array of
 {name: String,
 id: String}
 */
var getAllNoApplicants = exports.getAllNoApplicants = function () {
  var _ref16 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(bot) {
    var apiUser, _ref17, members, applicants, listMember, listApplicants;

    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            apiUser = _bluebird2.default.promisifyAll(bot.api.users);
            _context11.next = 3;
            return apiUser.listAsync({ token: bot.config.bot.app_token });

          case 3:
            _ref17 = _context11.sent;
            members = _ref17.members;
            _context11.next = 7;
            return getAllApplicants();

          case 7:
            applicants = _context11.sent;
            listMember = _lodash2.default.map(members, function (_ref18) {
              var id = _ref18.id,
                  name = _ref18.name;
              return { id: id, name: name };
            });
            listApplicants = _lodash2.default.map(applicants, function (_ref19) {
              var name = _ref19.name;
              return name;
            });

            _lodash2.default.remove(listMember, function (_ref20) {
              var name = _ref20.name;
              return listApplicants.indexOf(name) >= 0;
            });
            return _context11.abrupt('return', listMember);

          case 12:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, undefined);
  }));

  return function getAllNoApplicants(_x14) {
    return _ref16.apply(this, arguments);
  };
}();

var checkIfFirstTime = exports.checkIfFirstTime = function () {
  var _ref21 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(bot, message) {
    var _ref22, name, applicant;

    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return getSlackUser(bot, message.user);

          case 2:
            _ref22 = _context12.sent;
            name = _ref22.name;
            _context12.next = 6;
            return getApplicant(name);

          case 6:
            applicant = _context12.sent;

            if (!(!!applicant === false)) {
              _context12.next = 10;
              break;
            }

            _context12.next = 10;
            return (0, _firstTimeConversation2.default)(bot, message, { name: name });

          case 10:
            return _context12.abrupt('return', !!applicant);

          case 11:
          case 'end':
            return _context12.stop();
        }
      }
    }, _callee12, undefined);
  }));

  return function checkIfFirstTime(_x15, _x16) {
    return _ref21.apply(this, arguments);
  };
}();

// reads all admins applicants from Airtable, and returns
// a boolean checking if the current user is an admin or not.
var checkIfAdmin = exports.checkIfAdmin = function () {
  var _ref23 = _asyncToGenerator(regeneratorRuntime.mark(function _callee13(bot, message) {
    var admins, apiUser, records, _ref24, name;

    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            admins = [];
            apiUser = _bluebird2.default.promisifyAll(bot.api.users);
            _context13.next = 4;
            return (0, _airtable._getAllRecords)((0, _airtable.base)(AIRTABLE_APPLICANTS).select({
              view: 'Main View',
              filterByFormula: '{Admin}=1'
            }));

          case 4:
            records = _context13.sent;

            records.forEach(function (record) {
              var name = record.get('Slack Handle')[0];
              admins.push(name.replace(/^@/, ''));
            });
            _context13.next = 8;
            return apiUser.infoAsync({ user: message.user });

          case 8:
            _ref24 = _context13.sent;
            name = _ref24.user.name;
            return _context13.abrupt('return', admins.indexOf(name) >= 0);

          case 11:
          case 'end':
            return _context13.stop();
        }
      }
    }, _callee13, undefined);
  }));

  return function checkIfAdmin(_x17, _x18) {
    return _ref23.apply(this, arguments);
  };
}();

/* reads all pairing from Airtable, and returns them as an Array of
 {name: String,
 isLearner: Boolean,
 teacherName: String,
 learning: String,
 isTeacher: Boolean,
 learnerName: String,
 teaching: String}
 */
var getMembersPaired = exports.getMembersPaired = function () {
  var _ref25 = _asyncToGenerator(regeneratorRuntime.mark(function _callee14() {
    var applicants, members, pairings;
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.next = 2;
            return getAllApplicants();

          case 2:
            applicants = _context14.sent;
            members = _lodash2.default.map(applicants, function (_ref26) {
              var name = _ref26.name;
              return { name: name, isLearner: false, isTeacher: false };
            });
            _context14.next = 6;
            return getPairingsNotIntroduced();

          case 6:
            pairings = _context14.sent;

            pairings.forEach(function (record) {
              var learner = record.get('Learner');
              var teacher = record.get('Teacher');
              var skills = record.get('Skill');
              var index = _lodash2.default.random(skills.length - 1);
              var skill = skills[index];
              var indexLearner = _lodash2.default.findIndex(members, function (e) {
                return e.name === learner;
              });
              var indexTeacher = _lodash2.default.findIndex(members, function (e) {
                return e.name === teacher;
              });
              members[indexLearner].isLearner = true;
              members[indexLearner].teacherName = teacher;
              members[indexLearner].learning = skill;
              members[indexTeacher].isTeacher = true;
              members[indexTeacher].learnerName = learner;
              members[indexTeacher].teaching = skill;
            });
            return _context14.abrupt('return', members);

          case 9:
          case 'end':
            return _context14.stop();
        }
      }
    }, _callee14, undefined);
  }));

  return function getMembersPaired() {
    return _ref25.apply(this, arguments);
  };
}();

var getPairingsNotIntroduced = exports.getPairingsNotIntroduced = function () {
  var _ref27 = _asyncToGenerator(regeneratorRuntime.mark(function _callee15() {
    var pairings;
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            _context15.next = 2;
            return (0, _airtable._getAllRecords)((0, _airtable.base)(AIRTABLE_PAIRING).select({
              view: 'Main View',
              filterByFormula: '{Introduced}=0'
            }));

          case 2:
            pairings = _context15.sent;
            return _context15.abrupt('return', pairings);

          case 4:
          case 'end':
            return _context15.stop();
        }
      }
    }, _callee15, undefined);
  }));

  return function getPairingsNotIntroduced() {
    return _ref27.apply(this, arguments);
  };
}();

// reads a Pairing from Airtable
var getPairing = exports.getPairing = function () {
  var _ref28 = _asyncToGenerator(regeneratorRuntime.mark(function _callee16(tableName, pairingId) {
    var pairingRecords, createdAt;
    return regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            _context16.next = 2;
            return (0, _airtable._getAllRecords)((0, _airtable.base)(tableName).select({
              view: 'Main View',
              fields: ['Teacher', 'Learner', 'Skill', 'Paired On'],
              filterByFormula: '{Pairing Id}=\'' + pairingId + '\''
            }));

          case 2:
            pairingRecords = _context16.sent;
            createdAt = pairingRecords.length && pairingRecords[0].get('Paired On');
            return _context16.abrupt('return', {
              id: pairingId,
              createdAt: createdAt && createdAt + 'T00:00:00Z',
              pairs: _lodash2.default.map(pairingRecords, function (r) {
                return {
                  teacherName: r.get('Teacher'),
                  learnerName: r.get('Learner'),
                  skills: r.get('Skill')
                };
              })
            });

          case 5:
          case 'end':
            return _context16.stop();
        }
      }
    }, _callee16, undefined);
  }));

  return function getPairing(_x19, _x20) {
    return _ref28.apply(this, arguments);
  };
}();

// saves a Pairing to Airtable
var savePairing = exports.savePairing = function () {
  var _ref29 = _asyncToGenerator(regeneratorRuntime.mark(function _callee17(tableName, pairing) {
    var create;
    return regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            if (pairing.id) {
              _context17.next = 2;
              break;
            }

            return _context17.abrupt('return', console.log('missing pairing.id'));

          case 2:
            if (_lodash2.default.isArray(pairing.pairs)) {
              _context17.next = 4;
              break;
            }

            return _context17.abrupt('return', console.log('invalid pairing.pairs'));

          case 4:
            // write the pairs to Airtable
            create = _bluebird2.default.promisify((0, _airtable.base)(tableName).create);
            _context17.next = 7;
            return _bluebird2.default.map(pairing.pairs, function (pair) {
              return create({
                'Pairing Id': pairing.id,
                'Paired On': pairing.createdAt.substr(0, 10),
                'Teacher': pair.teacherName,
                'Learner': pair.learnerName,
                'Skill': pair.skills
              });
            });

          case 7:
            return _context17.abrupt('return', pairing);

          case 8:
          case 'end':
            return _context17.stop();
        }
      }
    }, _callee17, undefined);
  }));

  return function savePairing(_x21, _x22) {
    return _ref29.apply(this, arguments);
  };
}();

// removes a Pairing from Airtable
var destroyPairing = exports.destroyPairing = function () {
  var _ref30 = _asyncToGenerator(regeneratorRuntime.mark(function _callee18(tableName, pairingId) {
    var pairingRecords, destroy;
    return regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            _context18.next = 2;
            return (0, _airtable._getAllRecords)((0, _airtable.base)(tableName).select({
              view: 'Main View',
              fields: [],
              filterByFormula: '{Pairing Id}=\'' + pairingId + '\''
            }));

          case 2:
            pairingRecords = _context18.sent;
            destroy = _bluebird2.default.promisify((0, _airtable.base)(tableName).destroy);
            _context18.next = 6;
            return _bluebird2.default.map(pairingRecords, function (record) {
              return destroy(record.getId());
            });

          case 6:
            return _context18.abrupt('return', pairingId);

          case 7:
          case 'end':
            return _context18.stop();
        }
      }
    }, _callee18, undefined);
  }));

  return function destroyPairing(_x23, _x24) {
    return _ref30.apply(this, arguments);
  };
}();

// update a airtable member
var updateMember = exports.updateMember = function () {
  var _ref31 = _asyncToGenerator(regeneratorRuntime.mark(function _callee19(id, object) {
    var update, record;
    return regeneratorRuntime.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            update = _bluebird2.default.promisify((0, _airtable.base)(AIRTABLE_MEMBERS).update);
            _context19.next = 3;
            return update(id, object);

          case 3:
            record = _context19.sent;
            return _context19.abrupt('return', record);

          case 5:
          case 'end':
            return _context19.stop();
        }
      }
    }, _callee19, undefined);
  }));

  return function updateMember(_x25, _x26) {
    return _ref31.apply(this, arguments);
  };
}();

// get available members for weeklynews
var getAvailableMembers = exports.getAvailableMembers = function () {
  var _ref32 = _asyncToGenerator(regeneratorRuntime.mark(function _callee20() {
    var records, members, numberMembers, membersAvailable;
    return regeneratorRuntime.wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            _context20.next = 2;
            return (0, _airtable._getAllRecords)((0, _airtable.base)(AIRTABLE_MEMBERS).select({
              view: 'Main View',
              fields: ['Slack Handle', 'Asked for news this month [weeklynews]']
            }));

          case 2:
            records = _context20.sent;
            members = _lodash2.default.map(records, function (record) {
              return {
                airtableId: record.id,
                name: record.get('Slack Handle').replace(/^@/, ''),
                asked: record.get('Asked for news this month [weeklynews]')
              };
            });
            numberMembers = Math.floor(members.length / 4);
            membersAvailable = _lodash2.default.filter(members, { asked: undefined });
            return _context20.abrupt('return', { members: members, numberMembers: numberMembers, membersAvailable: membersAvailable });

          case 7:
          case 'end':
            return _context20.stop();
        }
      }
    }, _callee20, undefined);
  }));

  return function getAvailableMembers() {
    return _ref32.apply(this, arguments);
  };
}();

// get 25% random available members
var getRandomMembers = exports.getRandomMembers = function getRandomMembers(bot, message) {
  return new _bluebird2.default(function () {
    var _ref33 = _asyncToGenerator(regeneratorRuntime.mark(function _callee24(resolve, reject) {
      var getResult, res;
      return regeneratorRuntime.wrap(function _callee24$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              _context24.prev = 0;

              getResult = function () {
                var _ref34 = _asyncToGenerator(regeneratorRuntime.mark(function _callee21(params) {
                  var numberMembers, membersAvailable, list, _loop, i, allSlackUser;

                  return regeneratorRuntime.wrap(function _callee21$(_context21) {
                    while (1) {
                      switch (_context21.prev = _context21.next) {
                        case 0:
                          numberMembers = params.numberMembers, membersAvailable = params.membersAvailable;
                          list = [];

                          _loop = function _loop(i) {
                            var member = membersAvailable[Math.floor(Math.random() * membersAvailable.length)];
                            _lodash2.default.remove(membersAvailable, function (_ref36) {
                              var name = _ref36.name;
                              return name === member.name;
                            });
                            if (member && member.name !== '') list.push(member);
                          };

                          for (i = 0; i < numberMembers; i = i + 1) {
                            _loop(i);
                          }
                          _context21.next = 6;
                          return getAllMembers(bot);

                        case 6:
                          allSlackUser = _context21.sent;
                          return _context21.abrupt('return', _lodash2.default.map(list, function (_ref35) {
                            var name = _ref35.name,
                                airtableId = _ref35.airtableId;

                            var _$find = _lodash2.default.find(allSlackUser, { name: name }),
                                id = _$find.id,
                                firstName = _$find.profile.first_name;

                            return { airtableId: airtableId, id: id, name: name, firstName: firstName };
                          }));

                        case 8:
                        case 'end':
                          return _context21.stop();
                      }
                    }
                  }, _callee21, undefined);
                }));

                return function getResult(_x29) {
                  return _ref34.apply(this, arguments);
                };
              }();

              _context24.next = 4;
              return getAvailableMembers();

            case 4:
              res = _context24.sent;

              if (!(res.membersAvailable.length < res.numberMembers)) {
                _context24.next = 10;
                break;
              }

              bot.reply(message, 'A lot of people has already been contacted, I\'m cleaning the database...');
              forEach(res.members, function () {
                var _ref37 = _asyncToGenerator(regeneratorRuntime.mark(function _callee22(member) {
                  var done;
                  return regeneratorRuntime.wrap(function _callee22$(_context22) {
                    while (1) {
                      switch (_context22.prev = _context22.next) {
                        case 0:
                          done = this.async();
                          _context22.next = 3;
                          return updateMember(member.airtableId, {
                            'Asked for news this month [weeklynews]': false,
                            'Message Timestamp [weeklynews]': null,
                            'Asked by [weeklynews]': null
                          });

                        case 3:
                          done();

                        case 4:
                        case 'end':
                          return _context22.stop();
                      }
                    }
                  }, _callee22, this);
                }));

                return function (_x30) {
                  return _ref37.apply(this, arguments);
                };
              }(), _asyncToGenerator(regeneratorRuntime.mark(function _callee23() {
                return regeneratorRuntime.wrap(function _callee23$(_context23) {
                  while (1) {
                    switch (_context23.prev = _context23.next) {
                      case 0:
                        _context23.next = 2;
                        return getAvailableMembers();

                      case 2:
                        res = _context23.sent;
                        _context23.t0 = resolve;
                        _context23.next = 6;
                        return getResult(res);

                      case 6:
                        _context23.t1 = _context23.sent;
                        (0, _context23.t0)(_context23.t1);

                      case 8:
                      case 'end':
                        return _context23.stop();
                    }
                  }
                }, _callee23, undefined);
              })));
              _context24.next = 15;
              break;

            case 10:
              _context24.t0 = resolve;
              _context24.next = 13;
              return getResult(res);

            case 13:
              _context24.t1 = _context24.sent;
              (0, _context24.t0)(_context24.t1);

            case 15:
              _context24.next = 20;
              break;

            case 17:
              _context24.prev = 17;
              _context24.t2 = _context24['catch'](0);

              reject(_context24.t2);

            case 20:
            case 'end':
              return _context24.stop();
          }
        }
      }, _callee24, undefined, [[0, 17]]);
    }));

    return function (_x27, _x28) {
      return _ref33.apply(this, arguments);
    };
  }());
};

// reads all members from Airtable, and returns
// a boolean checking if the current user is responsible of the Weekly News.
var checkIfResponsible = exports.checkIfResponsible = function () {
  var _ref39 = _asyncToGenerator(regeneratorRuntime.mark(function _callee25(bot, message) {
    var slackUser, records, responsible;
    return regeneratorRuntime.wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            _context25.next = 2;
            return getSlackUser(bot, message.user);

          case 2:
            slackUser = _context25.sent;
            _context25.next = 5;
            return (0, _airtable._getAllRecords)((0, _airtable.base)(AIRTABLE_MEMBERS).select({
              view: 'Main View',
              fields: ['Slack Handle'],
              filterByFormula: 'AND(\n      FIND(\'Cofounder\', {Status}),\n      {Is responsible ? [weeklynews]} = 1\n    )'
            }));

          case 5:
            records = _context25.sent;
            responsible = records[0].get('Slack Handle').replace(/^@/, '');
            return _context25.abrupt('return', {
              isResponsible: responsible === slackUser.name,
              responsible: responsible
            });

          case 8:
          case 'end':
            return _context25.stop();
        }
      }
    }, _callee25, undefined);
  }));

  return function checkIfResponsible(_x31, _x32) {
    return _ref39.apply(this, arguments);
  };
}();

// get the current and the next responsible
var getResponsibles = exports.getResponsibles = function () {
  var _ref40 = _asyncToGenerator(regeneratorRuntime.mark(function _callee26(bot) {
    var members, records, index, _members$index, responsibleName, airtableId, nextIndex, _members$nextIndex, nextResponsibleName, nextAirtableId, allMembers, _$find2, responsibleId, _$find3, nextResponsibleId;

    return regeneratorRuntime.wrap(function _callee26$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            members = [];
            _context26.next = 3;
            return (0, _airtable._getAllRecords)((0, _airtable.base)(AIRTABLE_MEMBERS).select({
              view: 'Main View',
              fields: ['Name', 'Slack Handle', 'Is responsible ? [weeklynews]'],
              filterByFormula: 'FIND(\'Cofounder\', {Status})'
            }));

          case 3:
            records = _context26.sent;

            records.forEach(function (record) {
              var name = record.get('Name');
              members.push({
                airtableId: record.id,
                slackName: record.get('Slack Handle').replace(/^@/, ''),
                lastName: name.substring(name.indexOf(' '), name.length),
                isResponsible: record.get('Is responsible ? [weeklynews]')
              });
            });
            members.sort(function (a, b) {
              if (a.lastName < b.lastName) return -1;
              if (a.lastName > b.lastName) return 1;
              return 0;
            });
            index = _lodash2.default.findIndex(members, { isResponsible: true });
            _members$index = members[index], responsibleName = _members$index.slackName, airtableId = _members$index.airtableId;
            nextIndex = index + 1 === members.length ? 0 : index + 1;
            _members$nextIndex = members[nextIndex], nextResponsibleName = _members$nextIndex.slackName, nextAirtableId = _members$nextIndex.airtableId;
            _context26.next = 12;
            return getAllMembers(bot);

          case 12:
            allMembers = _context26.sent;
            _$find2 = _lodash2.default.find(allMembers, { name: responsibleName }), responsibleId = _$find2.id;
            _$find3 = _lodash2.default.find(allMembers, { name: nextResponsibleName }), nextResponsibleId = _$find3.id;
            return _context26.abrupt('return', { responsibleId: responsibleId, nextResponsibleId: nextResponsibleId, airtableId: airtableId, nextAirtableId: nextAirtableId });

          case 16:
          case 'end':
            return _context26.stop();
        }
      }
    }, _callee26, undefined);
  }));

  return function getResponsibles(_x33) {
    return _ref40.apply(this, arguments);
  };
}();

// get the last weekly news message's timestamp of a user
var getTimestamp = exports.getTimestamp = function () {
  var _ref41 = _asyncToGenerator(regeneratorRuntime.mark(function _callee27(bot, userId, allMembers) {
    var _$find4, name, records;

    return regeneratorRuntime.wrap(function _callee27$(_context27) {
      while (1) {
        switch (_context27.prev = _context27.next) {
          case 0:
            _$find4 = _lodash2.default.find(allMembers, { id: userId }), name = _$find4.name;
            _context27.next = 3;
            return (0, _airtable._getAllRecords)((0, _airtable.base)(AIRTABLE_MEMBERS).select({
              view: 'Main View',
              fields: ['Message Timestamp [weeklynews]'],
              filterByFormula: '{Slack Handle} = \'@' + name + '\''
            }));

          case 3:
            records = _context27.sent;
            return _context27.abrupt('return', records[0].get('Message Timestamp [weeklynews]'));

          case 5:
          case 'end':
            return _context27.stop();
        }
      }
    }, _callee27, undefined);
  }));

  return function getTimestamp(_x34, _x35, _x36) {
    return _ref41.apply(this, arguments);
  };
}();

// get users already asked this month
var getUsersAskedByResponsible = exports.getUsersAskedByResponsible = function () {
  var _ref42 = _asyncToGenerator(regeneratorRuntime.mark(function _callee28(bot, userId) {
    var users, records, allMembers;
    return regeneratorRuntime.wrap(function _callee28$(_context28) {
      while (1) {
        switch (_context28.prev = _context28.next) {
          case 0:
            users = [];
            _context28.next = 3;
            return (0, _airtable._getAllRecords)((0, _airtable.base)(AIRTABLE_MEMBERS).select({
              view: 'Main View',
              fields: ['Slack Handle'],
              filterByFormula: 'AND(\n      {Asked for news this month [weeklynews]} = 1,\n      {Asked by [weeklynews]} = \'' + userId + '\'\n    )'
            }));

          case 3:
            records = _context28.sent;
            _context28.next = 6;
            return getAllMembers(bot);

          case 6:
            allMembers = _context28.sent;

            records.forEach(function (record) {
              var name = record.get('Slack Handle').replace(/^@/, '');

              var _$find5 = _lodash2.default.find(allMembers, { name: name }),
                  id = _$find5.id;

              users.push(id);
            });
            return _context28.abrupt('return', users);

          case 9:
          case 'end':
            return _context28.stop();
        }
      }
    }, _callee28, undefined);
  }));

  return function getUsersAskedByResponsible(_x37, _x38) {
    return _ref42.apply(this, arguments);
  };
}();