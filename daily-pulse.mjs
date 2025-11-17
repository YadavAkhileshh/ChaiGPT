// daily-pulse.mjs
import 'dotenv/config';
import { getUSTrends, postTweet, postReply } from './utils/twitter.js';
import { generatePulse } from './utils/gemini.js';
import { fetchHNTop, fetchTechNews } from './utils/data-sources.js';

async function runPulse() {
  console.log("⚡ Starting BolAI Pulse...");

  // 🛡️ Fetch with fallbacks
  let trends = ["AI", "Tech"];
  let hn = [];
  let news = [];

  try {
    trends = await getUSTrends();
  } catch (e) {
    console.warn("⚠️ Trends fallback used");
  }

  try {
    hn = await fetchHNTop(3);
  } catch (e) {
    console.warn("⚠️ HN fallback used");
  }

  try {
    news = await fetchTechNews();
  } catch (e) {
    console.warn("⚠️ News fallback used");
  }

  // ✅ Proceed even if some data missing
  const context = { trends, hn, news };
  console.log("Context:", context);

  const { tweet, reply } = await generatePulse(context);

  const main = await postTweet(tweet);
  await postReply(main.data.id, reply);

  console.log("✅ Posted:", tweet);
}

runPulse().catch(console.error);