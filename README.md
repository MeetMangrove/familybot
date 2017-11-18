# Mangrove Familybot

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
RACHID_FIREBASE_URI=***
RACHID_SLACK_CLIENT_ID=***
RACHID_SLACK_CLIENT_SECRET=***

FRESHMANATEE_FIREBASE_URI=***
FRESHMANATEE_SLACK_CLIENT_ID=***
FRESHMANATEE_SLACK_CLIENT_SECRET=***

FIRECRAB_FIREBASE_URI=***
FIRECRAB_SLACK_CLIENT_ID=***
FIRECRAB_SLACK_CLIENT_SECRET=***

AIRTABLE_API_KEY=***
AIRTABLE_BASE_KEY=***

HOSTNAME=***
MAILGUN_API_KEY=***
NODE_ENV=DEVELOPMENT
PORT=5000
```

### How to use in development

Use a tunnelling software like ngrok to expose each bot under its own domain.

Start ngrok
```
$ ngrok http 5000
```

Then set the HOSTNAME env to the new ngrok url.

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
