const { ALGOLIA_ID, ALGOLIA_ADMIN_KEY } = process.env;
const algolia = require('algoliasearch');
const algoliaApp = algolia(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

const formatPost = (post) => {
  const currProfileImg = post.primary_author.profile_image;
  const profileImageUrl =
    currProfileImg && currProfileImg.includes('//www.gravatar.com/avatar/')
      ? `https:${currProfileImg}`
      : currProfileImg;

  return {
    objectID: post.id,
    title: post.title,
    author: {
      name: post.primary_author.name,
      url: post.primary_author.url,
      profileImage: profileImageUrl
    },
    tags: post.tags.map((obj) => {
      return {
        name: obj.name,
        url: obj.url
      };
    }),
    url: post.url,
    featureImage: post.feature_image,
    publishedAt: post.published_at,
    publishedAtTimestamp: (new Date(post.published_at).getTime() / 1000) | 0
  };
};

const indexNameMap = {
  'http://localhost:2368/': 'news-dev',
  'https://www.freecodecamp.dev/news/': 'news-dev',
  'https://www.freecodecamp.org/news/': 'news',
  'https://www.freecodecamp.org/espanol/news/': 'news-es',
  'https://chinese.freecodecamp.org/news/': 'news-zh'
};

const setIndex = (url) => {
  const paths = Object.keys(indexNameMap);
  let indexStr;

  paths.forEach((path) => {
    if (url.startsWith(path)) {
      indexStr = indexNameMap[path];
    }
  });

  return algoliaApp.initIndex(indexStr);
};

module.exports = {
  formatPost,
  setIndex
};
