# Serverless Indexer

This is a set of Lambda functions written in the [Serverless](https://www.serverless.com/) framework that are triggered by webhooks on [Ghost](https://ghost.org/).

Here are the current Ghost events / webhooks, and their endpoints:

| Ghost Event | Endpoint |
| ---- | ---- |
| Post published | .../*stage*/add-index |
| Post unpublished | .../*stage*/delete-index |
| Post deleted | .../*stage*/deleted-index |
| Published post updated | .../*stage*/update-index |

The Lambda function on each endpoint receives the blog post from the Ghost webhook and updates the correct [Algolia](https://www.algolia.com/) index based on the origin of the Ghost webhook.

Here are the currently configured origins and Algolia index:

| Ghost Origin | Algolia index |
| ---- | ---- |
| http://localhost:2368 | dev-news |
| https://www.freecodecamp.dev/news/ | dev-news |
| https://www.freecodecamp.org/news/ | news |
| https://www.freecodecamp.org/espanol/news/ | news-es |
| https://chinese.freecodecamp.org/news/ | news-zh |

## How to prepare your local machine

Follow these steps to start developing locally:

1. Create an Algolia account with access to the freeCodeCamp news indexes (see table above)
1. Create an [IAM](https://aws.amazon.com/iam/) account under the freeCodeCamp AWS team with access to [Secrets Manager]()

**Prerequisites**: 

- An AWS account with access to Secrets Manager and AWS cli
- An Algolia account with pre-configured indexes (see table above)
- The Serverless framework
