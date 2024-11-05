# Search Indexer

This is a set of serverless functions triggered by Hashnode or Ghost webhooks to index posts from our publications into Algolia indicies for our search bar. They're built and configured for the [DigitalOcean Functions platform](https://cloud.digitalocean.com/functions) and are deployed using the [doctl](https://docs.digitalocean.com/reference/doctl/) CLI to the fCC Team's DigitalOcean account.

Here are the current Hashnode events / webhooks and their corresponding functions:

| Hashnode Event         | Function                          |
| ---------------------- | --------------------------------- |
| Post published         | .../hashnode/add-or-update-record |
| Post deleted           | .../hashnode/delete-record        |
| Published post updated | .../hashnode/add-or-update-record |

And here are the current Ghost events / webhooks and their endpoints:

| Ghost Event            | Function                       |
| ---------------------- | ------------------------------ |
| Post published         | .../ghost/add-or-update-record |
| Published post updated | .../ghost/add-or-update-record |
| Post unpublished       | .../ghost/delete-record        |
| Post deleted           | .../ghost/delete-record        |

Finally, here are the currently configured Algolia indices for each publication:

| Publication URL                               | CMS      | Algolia index |
| --------------------------------------------- | -------- | ------------- |
| https://www.freecodecamp.org/news/            | Hashnode | news          |
| https://chinese.freecodecamp.org/news/        | Ghost    | news-zh       |
| https://www.freecodecamp.org/espanol/news/    | Ghost    | news-es       |
| https://www.freecodecamp.org/italian/news/    | Ghost    | news-it       |
| https://www.freecodecamp.org/japanese/news/   | Ghost    | news-ja       |
| https://www.freecodecamp.org/korean/news/     | Ghost    | news-ko       |
| https://www.freecodecamp.org/portuguese/news/ | Ghost    | news-pt-br    |
| https://www.freecodecamp.org/ukrainian/news/  | Ghost    | news-uk       |

## Prerequisites

- [doctl](https://docs.digitalocean.com/reference/doctl/) installed
- An account on DigitalOcean with member-level access to the fCC Team
- Access to the Technical Accounts vault on 1Password
- An [Algolia](https://www.algolia.com/) account access to the pre-configured indices above (see table)

## How to Prepare Your Local Machine

1. Clone this repo and run `npm ci` from the root directory to install the necessary packages.
1. Go to 1Password, search for the shared `[.env.*] [dev] [prd] Search Indexer` note.
1. Within the `do-functions-directory` create two new files named `.env.dev` and `.env.prd`, and set `ALGOLIA_APP_ID` and `ALGOLIA_ADMIN_KEY` to the Algolia application ID and admin key for each respective stage using the values from the 1Password note above.
1. If this is your first time using doctl, create a new `fcc-dev` context with `doctl auth init --context fcc-dev` (the context can be named anything, but `fcc-dev` will be used in the examples below).
1. Go to 1Password, search for the shared `[PAT] [Digital Ocean] fcc-dev-doctl-token (serverless indexer)` note, copy the PAT, and paste it into the terminal when prompted.
1. Run `doctl auth switch --context fcc-dev` to switch to the `fcc-dev` context.

## How to Develop or Update Functions

1. Functions are all within the `packages/<platform>/<function-name>` directory, and each function has its own directory with an `index.js` and `.include` file. The `.include` file is used to include the necessary dependencies for the function.
1. Each function is housed within a `packages/<platform>/<function-name>` directory, where `<platform>` is either `hashnode` or `ghost`, and `<function-name>` is the name of the function. The logic for each function is in the `index.js` file, and the `.include` file contains the dependencies that should be included in the function's `__deployer__.zip` file during the build process.
1. The `lib` directory contains shared code that is used by all functions. This includes the `utils/helpers.js` file, which contains the Algolia client and other shared functions, the shared `package.json` for all DO functions, and `node_modules` directory, which is created during the build process and should be copied to each function directory using the `.include` file.
1. New packages (groups of functions) and new individual functions should be added to the `project.yml` file. Each package and function is mapped to directories within the `packages` directory. The `project.yml` file is used by the `doctl` CLI to deploy the functions to DigitalOcean.

## How to Test Updates

1. For testing updates to code or new versions of npm packages, use a personal Hashnode publication and the Spanish Dockerized Ghost instance from the [news repo](https://github.com/freecodecamp/news/). Use the tables above to configure the webhooks for each platform to point to the functions in the `dev-search-indexer` namespace, which is pre-configured on DigitalOcean.

## How to Deploy Changes

1. To deploy changes to the `dev-search-indexer` namespace, run `npm run do-deploy-dev` from the root directory.
1. Once you're satisfied with the changes, deploy the changes to the production namespace with `npm run do-deploy-prd` from the root directory.

## How to Destroy Functions or Namespaces

**WARNING**: Destroying `dev` or `prd` functions is only necessary in a few cases, such as renaming an existing function. While destroying a function should still preserve the base URL for the function, it may cause the indicies for one or more publications to get out of sync. Destroying a namespace will remove all functions within that namespace, and change the base URL, requiring all webhooks all publications to be updated.

1. To remove a function, manually remove the function from the `project.yml` file and remove the function's directory from the `packages` directory. Next, go to the [DigitalOcean Functions dashboard](https://cloud.digitalocean.com/functions), select either the `dev-search-indexer` or `prd-search-indexer` namespace, and destroy the function from the dashboard.
1. To remove a namespace, go to the [DigitalOcean Functions dashboard](https://cloud.digitalocean.com/functions) and destroy either the `dev-search-indexer` or `prd-search-indexer` namespace. This will remove all functions within the namespace and change the base URL for the functions. This should only need to be done when migrating to a new region or if the namespace is no longer needed.
