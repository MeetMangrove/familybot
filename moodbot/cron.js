'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _cron = require('cron');

var _cron2 = _interopRequireDefault(_cron);

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _asyncForeach = require('async-foreach');

var _asyncForeach2 = _interopRequireDefault(_asyncForeach);

var _config = require('./config');

var _methods = require('../methods');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Created by thomasjeanneau on 16/07/2017.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

require('dotenv').config();

var CronJob = _cron2.default.CronJob;
var forEach = _asyncForeach2.default.forEach;
var MOODBOT_SLACK_CHANNEL_GENERAL_ID = process.env.MOODBOT_SLACK_CHANNEL_GENERAL_ID;


if (!MOODBOT_SLACK_CHANNEL_GENERAL_ID) {
  console.log('Error: Specify SLACK_CHANNEL_GENERAL_ID in a .env file');
  process.exit(1);
}

var askMood = new CronJob({
  cronTime: '00 00 15 * * *',
  onTick: function onTick() {
    var _this = this;

    _lodash2.default.forEach(_config.bots, function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(bot) {
        var members;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _methods.getAllMembers)(bot);

              case 2:
                members = _context2.sent;

                _lodash2.default.forEach(members, function (_ref2) {
                  var name = _ref2.name,
                      id = _ref2.id;

                  try {
                    bot.startPrivateConversation({ user: id }, function (err, convo) {
                      if (err) return console.log(err);

                      convo.addMessage({
                        text: 'Hello ' + name + '! :smile:'
                      }, 'default');

                      convo.addQuestion({
                        text: 'What is your mood today on a scale from 1 to 10?'
                      }, function (response, convo) {
                        var mood = _lodash2.default.find([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (n) {
                          return n === parseInt(response.text, 10);
                        });
                        if (mood) {
                          convo.gotoThread('comments');
                        } else {
                          convo.addMessage({
                            text: 'Hum... :thinking_face:'
                          }, 'default');
                          convo.addMessage({
                            text: 'This is not a validate mood, please try again :pray:'
                          }, 'default');
                          convo.repeat();
                        }
                        convo.next();
                      }, { key: 'level' }, 'default');

                      convo.addMessage({
                        text: 'Thanks for giving me your mood! :fire:'
                      }, 'comments');

                      convo.addQuestion({
                        text: 'If you want to add your status as well, please share it below. Otherwise, just say `no` to save your answer.'
                      }, function (response, convo) {
                        convo.gotoThread('saved');
                        convo.next();
                      }, { key: 'comment' }, 'comments');

                      convo.beforeThread('saved', function () {
                        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(convo, next) {
                          var id, level, comment;
                          return regeneratorRuntime.wrap(function _callee$(_context) {
                            while (1) {
                              switch (_context.prev = _context.next) {
                                case 0:
                                  _context.next = 2;
                                  return (0, _methods.getIdFromName)(name);

                                case 2:
                                  id = _context.sent;
                                  level = convo.extractResponse('level');
                                  comment = convo.extractResponse('comment');
                                  _context.next = 7;
                                  return (0, _methods.saveMood)(id, level, comment);

                                case 7:
                                  next();

                                case 8:
                                case 'end':
                                  return _context.stop();
                              }
                            }
                          }, _callee, this);
                        }));

                        return function (_x2, _x3) {
                          return _ref3.apply(this, arguments);
                        };
                      }());

                      convo.addMessage({
                        text: 'Awesome, it has been successfully saved!'
                      }, 'saved');

                      convo.addMessage({
                        text: 'See you tomorrow, take care :heart:'
                      }, 'saved');
                    });
                  } catch (e) {
                    console.log(e);
                    bot.reply({ user: id }, 'Oops..! :sweat_smile: A little error occur: `' + (e.message || e.error || e) + '`');
                  }
                });

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
  },
  start: false,
  timeZone: 'Europe/Paris'
});

var sendMood = new CronJob({
  cronTime: '00 15 33 * * *',
  onTick: function onTick() {
    var _this2 = this;

    _lodash2.default.forEach(_config.bots, function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(bot) {
        var moods, attachments;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                _context4.next = 3;
                return (0, _methods.getMoods)();

              case 3:
                moods = _context4.sent;
                attachments = [];

                forEach(moods, function () {
                  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(mood) {
                    var done, _ref6, user;

                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            done = this.async();
                            _context3.next = 3;
                            return (0, _methods.getMember)(mood['Member'][0]);

                          case 3:
                            _ref6 = _context3.sent;
                            user = _ref6.fields;

                            attachments.push({
                              'title': '<' + user['Slack Handle'] + '> is at ' + mood['Level'] + '/10 ' + (0, _methods.getEmoji)(mood['Level']),
                              'text': mood['Comment'],
                              'color': (0, _methods.getColor)(mood['Level']),
                              'thumb_url': user['Profile Picture'][0].url,
                              'footer': (0, _momentTimezone2.default)(mood['Date']).tz('Europe/Paris').format('MMM Do [at] h:mm A')
                            });
                            done();

                          case 7:
                          case 'end':
                            return _context3.stop();
                        }
                      }
                    }, _callee3, this);
                  }));

                  return function (_x5) {
                    return _ref5.apply(this, arguments);
                  };
                }(), function () {
                  return bot.say({
                    'text': 'Hi dream team! Here is your mood daily digest :sparkles:',
                    'channel': MOODBOT_SLACK_CHANNEL_GENERAL_ID,
                    'attachments': attachments
                  }, function (err, res) {
                    console.log(err);
                    console.log(res);
                  });
                });
                _context4.next = 12;
                break;

              case 8:
                _context4.prev = 8;
                _context4.t0 = _context4['catch'](0);

                console.log(_context4.t0);
                bot.reply({ user: MOODBOT_SLACK_CHANNEL_GENERAL_ID }, 'Oops..! :sweat_smile: A little error occur: `' + (_context4.t0.message || _context4.t0.error || _context4.t0) + '`');

              case 12:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this2, [[0, 8]]);
      }));

      return function (_x4) {
        return _ref4.apply(this, arguments);
      };
    }());
  },
  start: false,
  timeZone: 'Europe/Paris'
});

askMood.start();
sendMood.start();