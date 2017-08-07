'use strict';

var _methods = require('../methods');

var _config = require('./config');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Created by thomasjeanneau on 09/04/2017.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

require('dotenv').config();

var NODE_ENV = process.env.NODE_ENV;


if (!NODE_ENV) {
  console.log('Error: Specify NODE_ENV in a .env file');
  process.exit(1);
}

// User Commands

_config.controller.hears(['^Hello$', '^Yo$', '^Hey$', '^Hi$', '^Ouch$'], ['direct_message', 'direct_mention'], function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(bot, message) {
    var _ref2, name;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return (0, _methods.getSlackUser)(bot, message.user);

          case 3:
            _ref2 = _context.sent;
            name = _ref2.name;

            bot.startConversation(message, function (err, convo) {
              if (err) return console.log(err);
              convo.say('Hey ' + name + '!');
              convo.say('My name is Rachid, I\'m the <@moodbot> :smile:');
              convo.say('I will ping you everyday at 3pm to get your mood! :surfer:');
            });
            _context.next = 12;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context['catch'](0);

            console.log(_context.t0);
            bot.reply(message, 'Oops..! :sweat_smile: A little error occur: `' + (_context.t0.message || _context.t0.error || _context.t0) + '`');

          case 12:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 8]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

_config.controller.hears('[^\n]+', ['direct_message', 'direct_mention'], function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(bot, message) {
    var _ref4, name;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return (0, _methods.getSlackUser)(bot, message.user);

          case 3:
            _ref4 = _context2.sent;
            name = _ref4.name;

            bot.startConversation(message, function (err, convo) {
              if (err) return console.log(err);
              convo.say('Sorry ' + name + ', but I\'m too young to understand what you mean :flushed:');
              convo.say('I will ping you everyday at 3pm to get your mood! :surfer:');
            });
            _context2.next = 12;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2['catch'](0);

            console.log(_context2.t0);
            bot.reply(message, 'Oops..! :sweat_smile: A little error occur: `' + (_context2.t0.message || _context2.t0.error || _context2.t0) + '`');

          case 12:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[0, 8]]);
  }));

  return function (_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}());