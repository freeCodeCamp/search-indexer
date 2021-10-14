# Serverless Indexer

This is a set of Lambda functions written in the [Serverless](https://www.serverless.com/) framework that are triggered by webhooks on [Ghost](https://ghost.org/).

Here are the current Ghost events / webhooks, and their endpoints:

| Ghost Event            | Endpoint                  |
| ---------------------- | ------------------------- |
| Post published         | .../_stage_/add-index     |
| Post unpublished       | .../_stage_/delete-index  |
| Post deleted           | .../_stage_/deleted-index |
| Published post updated | .../_stage_/update-index  |

The Lambda function on each endpoint receives the blog post from the Ghost webhook and updates the correct [Algolia](https://www.algolia.com/) index based on the origin of the Ghost webhook.

Here are the currently configured origins and Algolia indices:

| Ghost Origin                                  | Algolia index |
| --------------------------------------------- | ------------- |
| http://localhost:2368                         | news-dev      |
| https://www.freecodecamp.org/news/            | news          |
| https://www.freecodecamp.org/espanol/news/    | news-es       |
| https://chinese.freecodecamp.org/news/        | news-zh       |
| https://www.freecodecamp.org/portuguese/news/ | news-pt-br    |
| https://www.freecodecamp.org/italian/news/    | news-it       |

**Prerequisites**:

- AWS CLI and an AWS account with access to Secrets Manager
- An [Algolia](https://www.algolia.com/) account access to the pre-configured indices above (see table)

## How to prepare your local machine

1. Create an Algolia account with access to the freeCodeCamp News indices
1. Go to LastPass, search for the shared `[keys] [AWS] [Lambda] - News Indexer` note, and add the `[news-indexer-lambda]` credentials to `~/.aws/credentials`
1. Clone this repo and install the necessary packages with `npm ci`
1. Copy `sample.env.yml` to a new file named `.env.yml`
1. In `.env.yml` set `AWS_PROFILE` to `'news-indexer-lambda'`
1. Start developing

## How to deploy changes

1. After a PR with changes is accepted and merged, deploy changes with `npm run deploy`

## How to change Algolia API keys on AWS

### Generate a new key on Algolia

1. Sign into Algolia with the dev@freecodecamp.org account
1. Click "API Keys", then click the "All API Keys" tab near the top of the screen
1. Click the "New API Key" button, and generate a new key with the following ACLs (action control lists): `search`, `addObject`, `deleteObject`, `browse`, `listIndexes`, `deleteIndex`
1. Click the "Create" button
1. Copy the new Algolia API key

### Update the Algolia key entry in AWS Secrets Manager

1. Create an [IAM](https://aws.amazon.com/iam/) account under the freeCodeCamp AWS team with access to [Secrets Manager](https://aws.amazon.com/secrets-manager/)
1. Sign in and go to https://us-east-2.console.aws.amazon.com/secretsmanager/
1. Click "serverless-indexer"
1. Click "Retrieve secret value" and click the "Edit" button
1. Paste the new Algolia API key in as the value of `ALGOLIA_ADMIN_KEY`
1. Click the "Save" button
