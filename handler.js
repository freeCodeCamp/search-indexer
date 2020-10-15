'use strict';

const { ALGOLIA_ID, ALGOLIA_ADMIN_KEY } = process.env;
const algolia = require('algoliasearch');
const algoliaApp = algolia(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
const index = algoliaApp.initIndex('news');

const { formatPost } = require('./helper-functions');

async function addIndex(req) {
  const body = JSON.parse(req.body);
  const postOrPage = body.post ? body.post : body.page;
  const currState = postOrPage.current;
  const newArticle = formatPost(currState);

  try {
    const addObj = await index.saveObject(newArticle);

    return {
      statusCode: 200,
      body: JSON.stringify({
        addedArticleId: newArticle.id,
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
  // obj in `req.body.post/page.previous`. Unpublishing a published 
  // article returns the article obj in `req.body.post/page.current`
  const body = JSON.parse(req.body);
  const postOrPage = body.post ? body.post : body.page;
  const prevState = postOrPage.previous;
  const currState = postOrPage.current;
  const targetId = prevState.id ? prevState.id : currState.id;

  try {
    const deleteObj = await index.deleteObject(targetId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        deletedArticleId: targetId,
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
  const postOrPage = body.post ? body.post : body.page;
  const prevState = postOrPage.previous;
  const currState = postOrPage.current;
  // The Ghost webhook returns only the updated values in
  // `req.body.post/page.previous`. Parse the keys from that
  // and only trigger an update if specific values changed
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
