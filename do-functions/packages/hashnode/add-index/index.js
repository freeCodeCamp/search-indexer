import { getPost, formatPost } from './helpers.js';

export const addIndex = async (params) => {
  const { id } = params;
  const post = await getPost(id);

  return formatPost(post);
};
