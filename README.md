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
MOODBOT_PORT=4000
NEWSBOT_MONGODB_URI=***************
NEWSBOT_SLACK_CLIENT_ID=***************
NEWSBOT_SLACK_CLIENT_SECRET=***************
NEWSBOT_PORT=5000
LEARNINGBOT_MONGODB_URI=***************
LEARNINGBOT_SLACK_CLIENT_ID=***************
LEARNINGBOT_SLACK_CLIENT_SECRET=***************
LEARNINGBOT_PORT=6000
AIRTABLE_API_KEY=***************
AIRTABLE_BASE_KEY=***************
AIRTABLE_MEMBERS=***************
AIRTABLE_MOOD=***************
AIRTABLE_APPLICANTS=***************
AIRTABLE_PAIRING=***************
NODE_ENV=DEVELOPMENT
```

### Run bots

In local for development:
```bash
$ npm run start_moodbot
$ npm run start_newsbot
$ npm run start_learningbot
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
$ npm run build
$ npm run moodbot
$ npm run newsbot
$ npm run learningbot
```
