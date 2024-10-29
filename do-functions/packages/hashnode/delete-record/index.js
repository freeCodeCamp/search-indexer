import { algoliaClient } from './helpers.js'; // Import from the same directory due to the pre deployment scripting process

export const deleteRecord = async (req) => {
  try {
    const { id } = req?.data?.post;

    // Note: Currently only the English publication is on Hashnode, and
    // the English indices are named 'news' in both the prod and dev
    // Algolia apps
    const algoliaRes = await algoliaClient.deleteObject({
      indexName: 'news',
      objectID: id
    });

    console.log(algoliaRes);

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
