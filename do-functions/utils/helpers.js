import 'dotenv/config';
import { gql, request } from 'graphql-request';
import { algoliasearch } from 'algoliasearch';

const { NODE_ENV } = process.env;
const algoliaID =
  NODE_ENV === 'production'
    ? process.env.PRD_ALGOLIA_ID
    : process.env.DEV_ALGOLIA_ID;
const algoliaAdminKey =
  NODE_ENV === 'production'
    ? process.env.PRD_ALGOLIA_ADMIN_KEY
    : process.env.DEV_ALGOLIA_ADMIN_KEY;

export const algoliaClient = algoliasearch(algoliaID, algoliaAdminKey);

export const getPost = async (id) => {
  try {
    const query = gql`
      query getPost($id: ID!) {
        post(id: $id) {
          id
          slug
          title
          author {
            username
            name
            profilePicture
          }
          tags {
            id
            name
            slug
          }
          coverImage {
            url
          }
          publishedAt
          updatedAt
        }
      }
    `;
    const res = await request('https://gql.hashnode.com', query, {
      id
    });

    return res.post;
  } catch (err) {
    console.error(err);
  }
};

export const formatPost = (post) => {
  const { id, title, slug, author, tags, coverImage, publishedAt } = post;
  const algoliaFilterRegex = [/java\b/i];

  return {
    objectID: id,
    title: title,
    author: {
      name: author.name,
      url: `https://www.freecodecamp.org/news/author/${author.username}`,
      profileImage: author?.profilePicture ? author?.profilePicture : null
    },
    tags: tags.map((tag) => {
      return {
        name: tag.name,
        url: `https://www.freecodecamp.org/news/tag/${tag.slug}/`
      };
    }),
    url: `https://www.freecodecamp.org/news/${slug}/`,
    featureImage: coverImage ? coverImage?.url : null,
    publishedAt: publishedAt,
    publishedAtTimestamp: (new Date(publishedAt).getTime() / 1000) | 0,
    filterTerms: algoliaFilterRegex.reduce((acc, regex) => {
      const isMatch = title.match(regex);
      if (isMatch) acc.push(isMatch[0].toLowerCase());

      return acc;
    }, [])
  };
};

export const getHits = async () => {
  // Note: Currently only the English publication is on Hashnode, and
  // the English indices are named 'news' in both the prod and dev
  // Algolia apps
  const hits = await algoliaClient.browse({ indexName: 'news' });

  return hits;
};
