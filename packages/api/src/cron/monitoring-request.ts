import fetch from 'node-fetch';

export default () => {
  try {
    fetch(`${process.env.DEPLOY_URL}/monitoring?apiInternalKey=${process.env.INTERNAL_API_KEY}`);
  } catch(e) {
    console.log(e);
  }
};
