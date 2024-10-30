# Search Indexer

## DigitalOcean Functions

Note: Currently only the English publication on Hashnode is using DigitalOcean Functions. The other publications are using AWS Lambda deployed via the Serverless Framework.

This is a pair of functions that are triggered by Hashnode webhooks to index posts from our English publication into Algolia for our search bar. They're built with DigitalOcean Functions and are deployed using the [doctl](https://docs.digitalocean.com/reference/doctl/) CLI to the fCC Team's DigitalOcean account.

Here are the current Hashnode events / webhooks, and their endpoints:

| Hashnode Event         | Endpoint                 |
| ---------------------- | ------------------------ |
| Post published         | .../add-or-update-record |
| Post deleted           | .../delete-record        |
| Published post updated | .../add-or-update-record |

And here are the currently configured Algolia indices:

| Publication URL                    | Algolia index |
| ---------------------------------- | ------------- |
| https://www.freecodecamp.org/news/ | news          |

**Prerequisites**:

- [doctl](https://docs.digitalocean.com/reference/doctl/) installed
- An account on DigitalOcean with member-level access to the fCC Team
- Access to the Technical Accounts vault on 1Password
- An [Algolia](https://www.algolia.com/) account access to the pre-configured indices above (see table)

## How to prepare your local machine

1. Clone this repo and run `npm ci` from the root directory to install the necessary packages.
1. Go to 1Password, search for the shared `[.env.*] [dev] [prd] Search Indexer` note.
1. Within the `do-functions-directory` create two new files named `.env.dev` and `.env.prd`, and set `ALGOLIA_APP_ID` and `ALGOLIA_ADMIN_KEY` to the Algolia application ID and admin key for each respective stage using the values from the 1Password note above.
1. If this is your first time using doctl, create a new `fcc-dev` context with `doctl auth init --context fcc-dev` (the context can be named anything, but `fcc-dev` will be used in the examples below).
1. Go to 1Password, search for the shared `[PAT] [Digital Ocean] fcc-dev-doctl-token (serverless indexer)` note, copy the PAT, and paste it into the terminal when prompted.
1. Run `doctl auth switch --context fcc-dev` to switch to the `fcc-dev` context.

## General notes about DigitalOcean Functions

1. Currently, since we're supporting both AWS Lambda and DigitalOcean Functions, all DO Function related code is in the `do-functions` directory. Later on, we can move the DO Functions to the root directory and update the deployment scripts accordingly.
1. Functions are all within the `packages` directory, and each function has its own directory with an `index.js` and `.include` file. The `.include` file is used to include the necessary dependencies for the function.
1. The `lib` directory contains shared code that is used by all functions. This includes the `utils/helpers.js` file, which contains the Algolia client and other shared functions, the `package.json` file, and `node_modules` directory, which is created during the build process and should be copied to each function directory using the `.include` file.
1. New packages, which are groups of functions, and individual functions, should be added to the `project.yml` file. Each package and function is mapped to directories within the `packages` directory. The `project.yml` file is used by the `doctl` CLI to deploy the functions to DigitalOcean.

## How to develop and test updates

1. For testing updates to code or NPm packages, use a personal Hashnode publication with webhooks pointing to the functions in the `dev-search-indexer` namespace, which is pre-configured on DigitalOcean. This way you can test changes without affecting the production Algolia index.
1. To deploy changes to the `dev-search-indexer` namespace, run `npm run do-deploy-dev` from the root directory.
1. Once you're satisfied with the changes, deploy the changes to the production namespace with `npm run do-deploy-prd` from the root directory.

## Serverless Framework

These are a group of Lambda functions that are designed to be triggered by webhooks on our self-hosted [Ghost](https://ghost.org/) instances. These functions are created using the [Serverless](https://www.serverless.com/) framework and are used to index articles from various news sources into a universal search bar.

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
| https://chinese.freecodecamp.org/news/        | news-zh       |
| https://www.freecodecamp.org/espanol/news/    | news-es       |
| https://www.freecodecamp.org/italian/news/    | news-it       |
| https://www.freecodecamp.org/japanese/news/   | news-ja       |
| https://www.freecodecamp.org/korean/news/     | news-ko       |
| https://www.freecodecamp.org/portuguese/news/ | news-pt-br    |
| https://www.freecodecamp.org/ukrainian/news/  | news-uk       |

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

## How to develop and test locally

1. Make your changes and run `npm start`
1. Open your local Ghost Integrations dashboard at http://localhost:2368/ghost/#/settings/integrations
1. Click "Add custom integration" to create a new custom integration
1. Check the console output and add the Lambda function URLs (ex: https://localhost:3000/dev/add-index) to the correct Ghost events. Check the Ghost events and endpoints table near the top of this document for more information
1. Publish, update, and delete articles on Ghost locally. You can view your changes on Algolia on the `dev` application in the `news-dev` index
1. If you make changes while the server is running, kill the server with Ctrl / Cmd + C. Then restart the server with `npm start` to test your changes

## How to deploy changes

1. After a PR with changes is accepted and merged, deploy changes with `npm run deploy-dev` or `npm run deploy`

## How to change Algolia API keys on AWS

### Generate a new key on Algolia

1. Sign into Algolia with the dev@freecodecamp.org account
1. Select the `dev` or `Production` application from the dropdown at the top of the page
1. Click "API Keys", then click the "All API Keys" tab near the top of the screen
1. Click the "New API Key" button, and generate a new key with the following ACLs (action control lists): `search`, `addObject`, `deleteObject`, `browse`, `listIndexes`, `deleteIndex`
1. Click the "Create" button
1. Copy the new Algolia API key

### Update the Algolia key entry in AWS Secrets Manager

1. Create an [IAM](https://aws.amazon.com/iam/) account under the freeCodeCamp AWS team with access to [Secrets Manager](https://aws.amazon.com/secrets-manager/)
1. Sign in and go to https://us-east-2.console.aws.amazon.com/secretsmanager/
1. Click "serverless-indexer"
1. Click "Retrieve secret value" and click the "Edit" button
1. Paste the new Algolia API key in as the value of `ALGOLIA_ADMIN_KEY` in either the `dev` or `prod` object
1. Click the "Save" button

## How to remove a service

**WARNING**: Removing a `dev` or `prod` service is only necessary in a few cases, such as migrating to a new region.

By removing a service, the base URL for the Lambda functions will be lost. This means that all the webhooks in each Ghost instance will need to be updated once the service is redeployed.

To deploy updates, it's not necessary to remove a service first. Just follow the deployment instructions [here](#how-to-deploy-changes).

Use the following commands with caution:

1. Install Serverless globally with `npm install -g serverless`
1. Run `serverless remove --stage [dev / prod] --region us-east-2`
