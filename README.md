# Mangrove Mood

All our bots in one place!

## Usages

### Installation

Clone the repo, then run:
```bash
$ npm install
```

### Set environmental variables

Create a .env file with the following variables and their values:
```bash
MOODBOT_MONGODB_URI=***************
MOODBOT_SLACK_CLIENT_ID=***************
MOODBOT_SLACK_CLIENT_SECRET=***************
MOODBOT_SLACK_CHANNEL_GENERAL_ID=***************
NEWSBOT_MONGODB_URI=***************
NEWSBOT_SLACK_CLIENT_ID=***************
NEWSBOT_SLACK_CLIENT_SECRET=***************
LEARNBOT_MONGODB_URI=***************
LEARNBOT_SLACK_CLIENT_ID=***************
LEARNBOT_SLACK_CLIENT_SECRET=***************
AIRTABLE_API_KEY=***************
AIRTABLE_BASE_KEY=***************
AIRTABLE_MEMBERS=***************
AIRTABLE_MOOD=***************
AIRTABLE_APPLICANTS=***************
AIRTABLE_PAIRING=***************
NODE_ENV=DEVELOPMENT
LEARNINGBOT_HOSTNAME={ngrok url}
MOODBOT_HOSTNAME={ngrok url}
NEWSBOT_HOSTNAME={ngrok url}
PORT=5000
```

### How to use in development

Use a tunnelling software like ngrok to expose each bot under its own domain.

set up the domains in your ~/.ngrok2/ngrok.yml file
```
tunnels:
  learnbot:
    proto: http
    addr: 5000
    subdomain: learningbot
  newsbot:
    proto: http
    addr: 5000
    subdomain: newsbot
  moodbot:
    proto: http
    addr: 5000
    subdomain: moodbot`
    
```

Start ngrok
```
$ ngrok start moodbot newsbot
```

Now set up the subdomains given by ngrok in your .env file
```
LEARNINGBOT_HOSTNAME=learnbot.ngrok.com
MOODBOT_HOSTNAME=moodbot.ngrok.com
NEWSBOT_HOSTNAME=newsbot.ngrok.com
```

Finally start the app
```
$ PORT=5000 npm start
```

You can now navigate to https://moodbot.ngrok.io/moodbot and https://learningbot.ngrok.io/learningbot

### How to use in production

Set up your DNS to point dedicated subdomains to the Heroku app
```
CNAME  learn.mydomain.com  myapp.herokuapp.com
CNAME  mood.mydomain.com  myapp.herokuapp.com
```

Set up the domain in the app's environment variables
```
$ heroku config:set LEARNINGBOT_HOSTNAME=learn.mydomain.com MOODBOT_HOSTNAME=mood.mydomain.com --app myapp
```

Register the domains with the Heroku router
```
$ heroku domains:add mood.mydomain.com --app myapp
$ heroku domains:add learn.mydomain.com --app myapp
```

You can now navigate to http://mood.mydomain.com/moodbot and http://learn.mydomain.com/learningbot

### Run bots

In local for development:
```bash
$ npm start
```

Lint code:
```bash
$ npm run lint
```

Fix lint errors:
```bash
$ npm run fix
```

Building:
```bash
$ npm run build
```

Heroku dynos:
```bash
$ npm start
```
