const { formatPost, setIndex } = require('./helper-functions');

async function addIndex(req) {
  const body = JSON.parse(req.body);
  const currState = body.post.current;
  const newArticle = formatPost(currState);
  const index = setIndex(newArticle.url);

  try {
    const addObj = await index.saveObject(newArticle);

    return {
      statusCode: 200,
      body: JSON.stringify({
        addedArticleId: newArticle.id,
        algoliaRes: addObj
      })
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: `Error: ${err}`
    };
  }
}

async function deleteIndex(req) {
  // Deleting a published article returns the article
  // obj in `req.body.post.previous`. Unpublishing a published
  // article returns the article obj in `req.body.post.current`
  const body = JSON.parse(req.body);
  const prevState = body.post.previous;
  const currState = body.post.current;
  const targetId = prevState.id ? prevState.id : currState.id;
  const publishedStatus = prevState.status === 'published' ? true : false;

  // Only update Algolia index if a published article is
  // unpublished or deleted
  if (publishedStatus) {
    // Deleted articles don't include an article url. But since
    // every article must include at least one article, set index
    // based on primary author page url instead
    const primaryAuthorUrl = prevState.authors
      ? prevState.authors[0].url
      : currState.authors[0].url;
    const index = setIndex(primaryAuthorUrl);

    try {
      const deleteObj = await index.deleteObject(targetId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          deletedArticleId: targetId,
          algoliaRes: deleteObj
        })
      };
    } catch (err) {
      console.error(err);

      return {
        statusCode: 500,
        body: `Error: ${err}`
      };
    }
  }
}

async function updateIndex(req) {
  const body = JSON.parse(req.body);
  const prevState = body.post.previous;
  const currState = body.post.current;
  // The Ghost webhook returns only the updated values in
  // `req.body.post.previous`. Parse the keys from that
  // and only trigger an update if specific values changed
  const keys = Object.keys(prevState);
  const targets = [
    'slug',
    'title',
    'authors',
    'tags',
    'feature_image',
    'published_at'
  ];
  const diff = keys.filter((val) => targets.includes(val));

  // Check for meaningful changes here before updating Algolia index
  if (diff.length > 0) {
    const updatedArticle = formatPost(currState);
    const index = setIndex(updatedArticle.url);

    try {
      const saveObj = await index.saveObject(updatedArticle);

      return {
        statusCode: 200,
        body: JSON.stringify({
          updatedArticleId: updatedArticle.id,
          algoliaRes: saveObj
        })
      };
    } catch (err) {
      console.error(err);

      return {
        statusCode: 500,
        body: `Error: ${err}`
      };
    }
  }
}

module.exports = {
  addIndex,
  updateIndex,
  deleteIndex
};
