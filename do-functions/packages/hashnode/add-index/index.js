import { getPost, formatPost } from './helpers.js'; // Import from the same directory due to the pre deployment scripting process

export const addIndex = async (params) => {
  const { id } = params;
  const post = await getPost(id);

  return formatPost(post);
};
