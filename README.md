# Mangrove Familybot

All our bots in one place!

## Usages

### Installation

Clone the repo, then run:
```bash
$ npm install
```

### Setup environment

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

GHOST_FIREBASE_URI=***
GHOST_SLACK_CLIENT_ID=***
GHOST_SLACK_CLIENT_SECRET=***

AIRTABLE_API_KEY=***
AIRTABLE_BASE_KEY=***

GMAIL_API_CLIENT_ID=***
GMAIL_API_CLIENT_SECRET=***
GMAIL_API_ACCESS_TOKEN=***

SLACK_TEAM_ID=***
HOSTNAME=***
```

Use a tunnelling software like ngrok to expose each bot under its own domain.

Start ngrok:
```
$ ngrok http 5000
```

Then set the HOSTNAME env to the new ngrok url. 

### Build bots

All bots can be tested individually through the _Ghost_ bot on the Mangrove Slack.
All messages will be posted in _#ghost-playground_ channel

Run Rachid:
```bash
$ npm run rachid
```

Run Firecrab:
```bash
$ npm run firecrab
```

Run Freshmanatee:
```bash
$ npm run freshmanatee
```

Run all the bots in production:
```bash
$ npm start
```

### Dev tools

Generate Gmail Credentials:
```bash
$ npm run credentials_gmail
```

Lint code:
```bash
$ npm run lint
```

Fix lint errors:
```bash
$ npm run fix
```

Building app:
```bash
$ npm run build
```
