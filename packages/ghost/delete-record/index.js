// The ../../../lib/utils directory is zipped in the same directory
// as the function during the build process
import {
  algoliaClient,
  getBaseSiteURL,
  getSearchIndexName
} from './utils/helpers.js';

export const deleteRecord = async (req) => {
  try {
    // Deleting a published post returns the post
    // obj in `req.post.previous`. Unpublishing a published
    // post returns the post obj in `req.post.current`,
    // so check both for an id to delete
    const currState = req?.post?.current;
    const prevState = req?.post?.previous;
    const targetId = currState?.id || prevState?.id;

    // Whether a published post is unpublished or deleted, the
    // status will be 'published' in the previous state
    if (prevState.status === 'published') {
      // Deleted posts don't include a url or a primary author object.
      // But since every post returns an author array, we can use
      // the first author object to determine the search index name.
      // This helps since we're handling data from localhost,
      // chinese.freecodecamp.org, and www.freecodecamp.org.
      const primaryAuthorURL = prevState.authors
        ? prevState.authors[0].url
        : currState.authors[0].url;
      const siteURL = getBaseSiteURL(primaryAuthorURL);
      const indexName = getSearchIndexName(siteURL);

      if (!indexName) {
        throw new Error('No matching index found for the current post');
      }

      const algoliaRes = await algoliaClient.deleteObject({
        indexName,
        objectID: targetId
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          objectID: targetId,
          algoliaRes
        })
      };
    }
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: `Error: ${err}`
    };
  }
};
