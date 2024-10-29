import { algoliaClient, formatPost, getPost } from './helpers.js'; // Import from the same directory due to the pre deployment scripting process

export const addOrUpdateRecord = async (req) => {
  try {
    const { id } = req?.data?.post;
    const post = await getPost(id);
    const formattedPost = formatPost(post);
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
