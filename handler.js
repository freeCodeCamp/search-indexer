'use strict';

const { ALGOLIA_ID, ALGOLIA_ADMIN_KEY } = process.env;
const algolia = require('algoliasearch');
const algoliaApp = algolia(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
const index = algoliaApp.initIndex('news');

const { formatPost } = require('./helper-functions');

async function addIndex(req) {
  const body = JSON.parse(req.body);
  const currState = body.post.current;
  const newPost= formatPost(currState);

  try {
    const addObj = await index.saveObject(newPost);

    return {
      statusCode: 200,
      body: JSON.stringify({
        addedArticleId: newPost.id,
        algoliaRes: addObj
      })
    }
  } catch(err) {
    console.error(err);

    return {
      statusCode: 500,
      body: `Error: ${err}`
    }
  }
}

async function deleteIndex(req) {
  // Deleting a published article returns the article
  // obj in `req.body.post.previous`. Unpublishing a published 
  // article returns the article obj in `req.body.post.current`
  const body = JSON.parse(req.body);
  const prevPost = body.post.previous;
  const currPost = body.post.current;
  const ghostId = prevPost.id ? prevPost.id : currPost.id;

  try {
    const deleteObj = await index.deleteObject(ghostId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        deletedArticleId: ghostId,
        algoliaRes: deleteObj
      })
    }
  } catch(err) {
    console.error(err);

    return {
      statusCode: 500,
      body: `Error: ${err}`
    }
  }
}

async function updateIndex(req) {
  const body = JSON.parse(req.body);
  const prevState = body.post.previous;
  const currState = body.post.current;
  // Parse the keys of what the Ghost webhook returns
  // and only trigger an update if specific values change
  const keys = Object.keys(prevState);
  const targets = ['slug', 'title', 'authors', 'tags', 'feature_image', 'published_at'];
  const diff = keys.filter(val => targets.includes(val));

  // Check for meaningful changes here before updating Algolia index
  if (diff.length > 0) {
    const updatedArticle = formatPost(currState);

    try {
      const saveObj = await index.saveObject(updatedArticle);

      return {
        statusCode: 200,
        body: JSON.stringify({
          updatedArticleId: updatedArticle.id,
          algoliaRes: saveObj
        })
      }
    } catch(err) {
      console.error(err);

      return {
        statusCode: 500,
        body: `Error: ${err}`
      }
    }
  }
}

module.exports = {
  addIndex,
  updateIndex,
  deleteIndex
}
