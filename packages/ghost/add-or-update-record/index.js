// The ../../../lib/utils directory is zipped in the same directory
// as the function during the build process
import {
  algoliaClient,
  formatGhostPost,
  getSearchIndexName
} from './utils/helpers.js';

export const addOrUpdateRecord = async (req) => {
  try {
    const post = req?.post?.current;
    const formattedPost = formatGhostPost(post);
    console.log('formattedPost:', formattedPost);
    const { objectID, url } = formattedPost;
    const targetSearchIndex = getSearchIndexName(url);

    if (!targetSearchIndex) {
      throw new Error('No matching index found for the current post');
    }

    const algoliaRes = await algoliaClient.addOrUpdateObject({
      indexName: targetSearchIndex,
      objectID,
      body: formattedPost
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        objectID,
        algoliaRes
      })
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: `Error: ${err}`
    };
  }
};
