'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bots = exports.controller = undefined;

var _localtunnel = require('localtunnel');

var _localtunnel2 = _interopRequireDefault(_localtunnel);

var _botkit = require('botkit');

var _botkit2 = _interopRequireDefault(_botkit);

var _botkitStorageMongo = require('botkit-storage-mongo');

var _botkitStorageMongo2 = _interopRequireDefault(_botkitStorageMongo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dotenv').config(); /**
                             * Created by thomasjeanneau on 08/02/2017.
                             */

var bots = {};
var _process$env = process.env,
    MOODBOT_SLACK_CLIENT_ID = _process$env.MOODBOT_SLACK_CLIENT_ID,
    MOODBOT_SLACK_CLIENT_SECRET = _process$env.MOODBOT_SLACK_CLIENT_SECRET,
    PORT = _process$env.PORT,
    MOODBOT_MONGODB_URI = _process$env.MOODBOT_MONGODB_URI,
    NODE_ENV = _process$env.NODE_ENV;


if (!MOODBOT_SLACK_CLIENT_ID || !MOODBOT_SLACK_CLIENT_SECRET || !PORT || !MOODBOT_MONGODB_URI || !NODE_ENV) {
  console.log('Error: Specify SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, PORT and MONGODB_URI_MOODBOT in a .env file');
  process.exit(1);
}

if (NODE_ENV === 'DEVELOPMENT') {
  var tunnel = (0, _localtunnel2.default)(PORT, { subdomain: 'moodbot' }, function (err, tunnel) {
    if (err) console.log(err);
    console.log('Bot running at the url: ' + tunnel.url);
  });
  tunnel.on('close', function () {
    console.log('Tunnel is closed');
  });
}

var trackBot = function trackBot(bot) {
  bots[bot.config.token] = bot;
};

var mongoStorage = new _botkitStorageMongo2.default({
  mongoUri: MOODBOT_MONGODB_URI
});

var controller = _botkit2.default.slackbot({
  debug: false,
  interactive_replies: true,
  require_delivery: true,
  storage: mongoStorage
});

controller.configureSlackApp({
  clientId: MOODBOT_SLACK_CLIENT_ID,
  clientSecret: MOODBOT_SLACK_CLIENT_SECRET,
  scopes: ['bot', 'chat:write:bot', 'users:read']
});

controller.setupWebserver(PORT, function (err) {
  if (err) return console.log(err);
  controller.createWebhookEndpoints(controller.webserver).createHomepageEndpoint(controller.webserver).createOauthEndpoints(controller.webserver, function (err, req, res) {
    if (err) return res.status(500).send('ERROR: ' + err);
    res.send('Success!');
  });
});

controller.on('create_bot', function (bot, config) {
  if (bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM(function (err) {
      if (!err) trackBot(bot);
      bot.startPrivateConversation({ user: config.createdBy }, function (err, convo) {
        if (err) return console.log(err);
        convo.say('I am a moodbot that has just joined your team');
        convo.say('You must now /invite me to a channel so that I can be of use!');
      });
    });
  }
});

controller.on('rtm_open', function () {
  console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function () {
  console.log('** The RTM api just closed');
});

controller.storage.teams.all(function (err, teams) {
  if (err) throw new Error(err);
  for (var t in teams) {
    if (teams[t].bot) {
      controller.spawn(teams[t]).startRTM(function (err, bot) {
        if (err) return console.log('Error connecting moodbot to Slack:', err);
        trackBot(bot);
      });
    }
  }
});

exports.controller = controller;
exports.bots = bots;