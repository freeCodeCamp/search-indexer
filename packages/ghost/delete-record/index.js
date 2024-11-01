// The ../../../lib/utils directory is zipped in the same directory
// as the function during the build process
import {
  algoliaClient,
  formatGhostPost,
  getSearchIndexName
} from './utils/helpers.js';

export const deleteRecord = async (req) => {
  try {
    const post = req?.post?.current;
    const prevState = req?.post?.previous;

    // The Ghost webhook returns only the updated values in `req.post.previous`.
    // Parse the keys from that and only trigger an update if specific values we
    // use in search records have been updated including `published_at`, which
    // appears when a draft is published
    const updateEvents = [
      'slug',
      'title',
      'authors',
      'tags',
      'feature_image',
      'published_at'
    ];
    const diff = Object.keys(prevState).filter((val) =>
      updateEvents.includes(val)
    );

    // Check if there are any meaningful changes before updating the record
    // on Algolia
    if (diff.length > 0) {
      const formattedPost = formatGhostPost(post);
      const { objectID, url } = formattedPost;
      const indexName = getSearchIndexName(url);

      if (!indexName) {
        throw new Error('No matching index found for the current post');
      }

      const algoliaRes = await algoliaClient.addOrUpdateObject({
        indexName,
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
    }
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: `Error: ${err}`
    };
  }
};
