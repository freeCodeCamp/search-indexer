'use strict';

const { ALGOLIA_ID, ALGOLIA_ADMIN_KEY } = process.env;

const algolia = require('algoliasearch');
const algoliaApp = algolia(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
// const index = algoliaApp.initIndex('news');
const index = algoliaApp.initIndex('test_serverless');

function formatArticle(article) {
  return {
    title: article.title,
    author: {
      name: article.primary_author.name,
      url: article.primary_author.url,
      profileImage: article.primary_author.profile_image
    },
    tags: article.tags.map(obj => {
      return {
        name: obj.name,
        url: obj.url
      }
    }),
    url: article.url,
    featureImage: article.feature_image,
    ghostId: article.id,
    publishedAt: article.published_at
  }
}

function getAlgoliaId(ghostId) {
  return index.search({ query: ghostId })
    .then(res => res.hits[0].objectID)
    .catch(err => console.log(err));
}

async function addIndex(req) {
  const body = JSON.parse(req.body);
  const currState = body.post.current;
  const newArticle = formatArticle(currState);

  const addObj = await index.addObject(newArticle)
    .then(res => res)
    .catch(err => console.log(err));

  console.log(newArticle);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      addedArticle: newArticle,
      algoliaRes: addObj
    })
  }
}

async function deleteIndex(req) {
  // Deleting a published article returns the article
  // obj in `req.body.post.previous`. Unpublishing a published 
  // article returns the article obj in `req.body.post.current`
  const body = JSON.parse(req.body);
  const prevState = body.post.previous;
  const currState = body.post.current;
  const ghostId = prevState.id ? prevState.id : currState.id;
  const algoliaId = await getAlgoliaId(ghostId);

  const deleteObj = await index.deleteObject(algoliaId)
    .then(res => res)
    .catch(err => console.log(err));

  console.log(deleteObj);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      deletedArticle: prevState ? prevState : currState,
      algoliaRes: deleteObj
    })
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

  // console.log(prevState, keys, diff);

  // Check for meaningful changes here before updating Algolia index
  if (diff.length > 0) {
    let updatedArticle = formatArticle(currState);
    const ghostId = updatedArticle.ghostId;
    const algoliaId = await getAlgoliaId(ghostId);

    updatedArticle['objectID'] = algoliaId;

    const saveObj = await index.saveObject(updatedArticle)
      .then(res => res)
      .catch(err => console.log(err));

    console.log(updatedArticle, saveObj)

    return {
      statusCode: 200,
      body: JSON.stringify({
        updatedArticle: updatedArticle,
        algoliaRes: saveObj
      })
    }
  }
}

module.exports = {
  addIndex,
  // updateIndex,
  deleteIndex
}
