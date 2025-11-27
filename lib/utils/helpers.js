import { gql, request } from 'graphql-request';
import { algoliasearch } from 'algoliasearch';

export const algoliaClient = algoliasearch(
  process.env.ALGOLIA_ID,
  process.env.ALGOLIA_ADMIN_KEY
);

const searchIndexNameMap = {
  // Dockerized Spanish Ghost instance for testing
  'http://localhost:3030': 'news-es',
  // The Chinese publication is at https://chinese.freecodecamp.org/news/,
  // but this map and the getSearchIndexName function are used after formatting
  // the post for Algolia, which updates necessary URLs for the search record
  // to start with https://www.freecodecamp.org/chinese/news/
  'https://www.freecodecamp.org/chinese/news/': 'news-zh',
  'https://www.freecodecamp.org/espanol/news/': 'news-es',
  'https://www.freecodecamp.org/italian/news/': 'news-it',
  'https://www.freecodecamp.org/japanese/news/': 'news-ja',
  'https://www.freecodecamp.org/korean/news': 'news-ko',
  'https://www.freecodecamp.org/portuguese/news/': 'news-pt-br',
  'https://www.freecodecamp.org/ukrainian/news/': 'news-uk'
};

export const getSearchIndexName = (url) => {
  const ghostSources = Object.keys(searchIndexNameMap);

  for (const ghostSource of ghostSources) {
    if (url.startsWith(ghostSource)) {
      return searchIndexNameMap[ghostSource];
    }
  }
};

export const getHashnodePost = async (id) => {
  try {
    const query = gql`
      query getHashnodePost($id: ID!) {
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

// Note: Consider merging the formatHashnodePost and formatGhostPost functions
const algoliaFilterRegex = [/java\b/i];

export const formatHashnodePost = (post) => {
  const { id, title, slug, author, tags, coverImage, publishedAt } = post;

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

export const getBaseSiteURL = (url) => {
  const URLObj = new URL(url);
  const { host, pathname } = URLObj;
  const pathParts = pathname.split('/').filter(Boolean);
  let siteLang;
  if (host.startsWith('chinese')) {
    siteLang = 'chinese';
  } else if (pathParts.length >= 3) {
    // Webhooks will only be triggered by posts, so the path will
    // always have 3-4 parts for our localized instances:
    // (/<lang>/news/<slug>/) or (/<lang>/news/<author>/<slug>/).
    // Or if it's coming from a Dockerized test instance / localhost,
    // it will only have 1 part: (/<slug>/).
    siteLang = pathParts[0];
  }
  const computedPath = siteLang ? `/${siteLang}/news/` : '/news/';

  if (host.startsWith('localhost')) {
    return `http://${host}${computedPath}`;
  } else {
    return `https://www.freecodecamp.org${computedPath}`;
  }
};

export const formatGhostPost = (post) => {
  const {
    id,
    title,
    slug,
    url,
    primary_author,
    tags,
    feature_image,
    published_at
  } = post;
  const siteURL = getBaseSiteURL(url);

  return {
    objectID: id,
    title: title,
    author: {
      name: primary_author.name,
      url: `${siteURL}author/${primary_author.slug}/`,
      profileImage:
        primary_author?.profile_image &&
        primary_author?.profile_image.includes('//www.gravatar.com/avatar/')
          ? `https:${primary_author?.profile_image}`
          : primary_author?.profile_image
    },
    tags: tags.map((tag) => {
      return {
        name: tag.name,
        url: `${siteURL}tag/${tag.slug}/`
      };
    }),
    url: `${siteURL}${slug}/`,
    featureImage: feature_image ? feature_image : null,
    publishedAt: published_at,
    publishedAtTimestamp: (new Date(published_at).getTime() / 1000) | 0,
    filterTerms: algoliaFilterRegex.reduce((acc, regex) => {
      const isMatch = title.match(regex);
      if (isMatch) acc.push(isMatch[0].toLowerCase());

      return acc;
    }, [])
  };
};
