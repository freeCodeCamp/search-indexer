import 'dotenv/config';
import { gql, request } from 'graphql-request';

export const getPost = async (id) => {
  console.log({ id, dotenvTest: process.env.DEV_ALGOLIA_ID });

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
      profileImage: author.profilePicture
    },
    tags: tags.map((tag) => {
      return {
        name: tag.name,
        url: `https://www.freecodecamp.org/news/tag/${tag.slug}/`
      };
    }),
    url: `https://www.freecodecamp.org/news/${slug}/`,
    featureImage: coverImage.url,
    publishedAt: publishedAt,
    publishedAtTimestamp: (new Date(publishedAt).getTime() / 1000) | 0,
    filterTerms: algoliaFilterRegex.reduce((acc, regex) => {
      const isMatch = title.match(regex);
      if (isMatch) acc.push(isMatch[0].toLowerCase());

      return acc;
    }, [])
  };
};
