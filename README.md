# Mangrove Mood

A mood bot to display each day the mood's team.

## Usages

### Installation

Clone the repo, then run:
```bash
$ npm install
```

### Set environmental variables

Create a .env file with the following variables and their values:
```bash
SLACK_CLIENT_ID=***************
SLACK_CLIENT_SECRET=***************
SLACK_CHANNEL_GENERAL_ID=***************
AIRTABLE_API_KEY=***************
AIRTABLE_BASE_KEY=***************
AIRTABLE_MEMBERS=***************
AIRTABLE_MOOD=***************
NEW_RELIC_LICENSE_KEY=***************
NEW_RELIC_APP_NAME=***************
NEW_RELIC_APDEX=***************
NEW_RELIC_NO_CONFIG_FILE=***************
MONGO_URL=***************
NODE_ENV=DEVELOPMENT
PORT=3000
```

### Run the bot

In local for development:
```bash
$ npm run start
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

Running in production mode after building:
```bash
$ npm run serve
```

Heroku dynos:
```bash
$ npm run web
```
