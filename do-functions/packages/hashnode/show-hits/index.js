import { getHits } from './helpers.js'; // Import from the same directory due to the pre deployment scripting process

export const showHits = async () => {
  const hits = await getHits();

  console.log({ hits });

  return hits;
};
