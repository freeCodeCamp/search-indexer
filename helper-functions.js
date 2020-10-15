const dasherize = name => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s/g, '-')
    .replace(/[^a-z\d\-.]/g, '');
}

const formatPost = post => {
  const currProfileImg = post.primary_author.profile_image;
  const profileImageUrl = (currProfileImg && currProfileImg.includes('//www.gravatar.com/avatar/')) ? `https:${currProfileImg}` : currProfileImg;

  return {
    objectID: post.id,
    title: post.title,
    author: {
      name: post.primary_author.name,
      url: post.primary_author.url,
      profileImage: profileImageUrl
    },
    tags: post.tags.map(obj => {
      return {
        name: obj.name,
        url: obj.url.includes('404') ? `https://www.freecodecamp.org/news/tag/${dasherize(obj.name)}/` : obj.url // occasionally gets a 404 -- maybe if there's only one article with this tag?
      }
    }),
    url: post.url,
    featureImage: post.feature_image,
    publishedAt: post.published_at,
    publishedAtTimestamp: new Date(post.published_at).getTime() / 1000 | 0
  }
}

module.exports = {
  formatPost
};
