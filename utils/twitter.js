// utils/twitter.js
import { TwitterApi } from 'twitter-api-v2';
import 'dotenv/config';

// OAuth 1.0a client for posting AS YOUR ACCOUNT
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// ✅ Post a tweet
export const postTweet = async (text) => {
  return await twitterClient.v2.tweet(text);
};

// ✅ Reply to a tweet
export const postReply = async (inReplyToTweetId, text) => {
  return await twitterClient.v2.reply(text, inReplyToTweetId);
};

// ✅ Safe mock for trends (no API call!)
export const getUSTrends = async () => {
  // Later: replace with HN/news keyword analysis
  return ["AI", "Tech", "Geopolitics", "Startups", "Web3"];
};