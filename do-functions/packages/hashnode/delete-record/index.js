// The ../../../lib/utils directory is zipped in the same directory
// as the function during the build process
import { algoliaClient } from './utils/helpers.js';

export const deleteRecord = async (req) => {
  try {
    const id = req?.data?.post?.id;
    if (!id) {
      throw new Error('No id found in request');
    }

    // Note: Currently only the English publication is on Hashnode, and
    // the English indices are named 'news' in both the prod and dev
    // Algolia apps
    const algoliaRes = await algoliaClient.deleteObject({
      indexName: 'news',
      objectID: id
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        objectID: id,
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
