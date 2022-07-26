const { ALGOLIA_ID, ALGOLIA_ADMIN_KEY } = process.env;
const algolia = require('algoliasearch');
const algoliaApp = algolia(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

const formatPost = (post) => {
  const { id, title, primary_author, tags, url, feature_image, published_at } =
    post;
  const currProfileImg = primary_author.profile_image;
  const profileImageUrl =
    currProfileImg && currProfileImg.includes('//www.gravatar.com/avatar/')
      ? `https:${currProfileImg}`
      : currProfileImg;
  const algoliaFilterRegex = [/java\b/i];

  return {
    objectID: id,
    title: title,
    author: {
      name: primary_author.name,
      url: primary_author.url,
      profileImage: profileImageUrl
    },
    tags: tags.map((obj) => {
      return {
        name: obj.name,
        url: obj.url
      };
    }),
    url: url,
    featureImage: feature_image,
    publishedAt: published_at,
    publishedAtTimestamp: (new Date(published_at).getTime() / 1000) | 0,
    filterTerms: algoliaFilterRegex.reduce((acc, regex) => {
      const isMatch = title.match(regex);
      if (isMatch) acc.push(isMatch[0].toLowerCase());

      return acc;
    }, [])
  };
};

const indexNameMap = {
  'http://localhost:2368/': 'news-dev',
  'https://www.freecodecamp.dev/news/': 'news-dev',
  'https://www.freecodecamp.org/news/': 'news',
  'https://www.freecodecamp.org/espanol/news/': 'news-es',
  'https://chinese.freecodecamp.org/news/': 'news-zh',
  'https://www.freecodecamp.org/portuguese/news/': 'news-pt-br',
  'https://www.freecodecamp.org/italian/news/': 'news-it',
  'https://www.freecodecamp.org/ukrainian/news/': 'news-uk',
  'https://www.freecodecamp.org/japanese/news/': 'news-ja',
  'https://www.freecodecamp.org/arabic/news/': 'news-ar',
  'https://www.freecodecamp.org/bengali/news/': 'news-bn',
  'https://www.freecodecamp.org/urdu/news/': 'news-ur',
  'https://www.freecodecamp.org/swahili/news': 'news-sw',
  'https://www.freecodecamp.org/korean/news': 'news-ko',
  'https://www.freecodecamp.org/turkish/news': 'news-tr',
  'https://www.freecodecamp.org/french/news': 'news-fr',
  'https://www.freecodecamp.org/hindi/news': 'news-hi',
  'https://www.freecodecamp.org/german/news': 'news-de',
  'https://www.freecodecamp.org/vietnamese/news': 'news-vi',
  'https://www.freecodecamp.org/indonesian': 'news-id'
};

const setIndex = (url) => {
  const paths = Object.keys(indexNameMap);
  let indexStr;

  paths.forEach((path) => {
    if (url.startsWith(path)) {
      indexStr = indexNameMap[path];
      return;
    }
  });

  return indexStr ? algoliaApp.initIndex(indexStr) : null;
};

module.exports = {
  formatPost,
  setIndex
};
