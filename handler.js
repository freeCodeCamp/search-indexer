'use strict';

const { ALGOLIA_ID, ALGOLIA_ADMIN_KEY } = process.env;

const algolia = require('algoliasearch');
const algoliaApp = algolia(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
const index = algoliaApp.initIndex('news');

const dasherize = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s/g, '-')
    .replace(/[^a-z\d\-.]/g, '');
}

function formatPost(post) {
  const currProfileImg = post.primary_author.profile_image;
  const profileImageUrl = (currProfileImg && currProfileImg.includes('//www.gravatar.com/avatar/')) ? `https:${currProfileImg}` : currProfileImg;

  return {
    objectID: post.id,
    title: post.title,
    author: {
      name: post.primary_author.name,
      url: post.primary_author.url,
      profileImage: profileImageUrl
    },
    tags: post.tags.map(obj => {
      return {
        name: obj.name,
        url: obj.url.includes('404') ? `https://www.freecodecamp.org/news/tag/${dasherize(obj.name)}/` : obj.url // occasionally gets a 404 -- maybe if there's only one article with this tag?
      }
    }),
    url: post.url,
    featureImage: post.feature_image,
    publishedAt: post.published_at,
    publishedAtTimestamp: new Date(post.published_at).getTime() / 1000 | 0
  }
}

async function addIndex(req) {
  console.log(req);
  const body = JSON.parse(req.body);
  const currState = body.post.current;
  const newPost= formatPost(currState);

  try {
    const addObj = await index.saveObject(newPost);

    console.log(addObj);

    return {
      statusCode: 200,
      body: JSON.stringify({
        addedArticle: newPost,
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

    console.log(deleteObj);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        deletedArticle: prevPost ? prevPost : currPost,
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

  // console.log(prevState, keys, diff);

  // Check for meaningful changes here before updating Algolia index
  if (diff.length > 0) {
    let updatedArticle = formatPost(currState);
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
