// The ../../../lib/utils directory is zipped in the same directory
// as the function during the build process
import {
  algoliaClient,
  formatHashnodePost,
  getHashnodePost
} from './utils/helpers.js';

export const addOrUpdateRecord = async (req) => {
  try {
    const id = req?.data?.post?.id;
    if (!id) {
      throw new Error('No id found in request');
    }

    const post = await getHashnodePost(id);
    const formattedPost = formatHashnodePost(post);
    const { objectID } = formattedPost;

    // Note: Currently only the English publication is on Hashnode, and
    // the English indices are named 'news' in both the prod and dev
    // Algolia apps
    const algoliaRes = await algoliaClient.addOrUpdateObject({
      indexName: 'news',
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
