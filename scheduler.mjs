import 'dotenv/config';
import { getUSTrends, postTweet, postReply } from './utils/twitter.js';
import { generatePulse } from './utils/gemini.js';
import { fetchHNTop, fetchTechNews } from './utils/data-sources.js';

async function runPulse() {
  console.log(`⚡ [${new Date().toLocaleString()}] Starting BolAI Pulse...`);

  let trends = ["AI", "Tech"];
  let hn = [];
  let news = [];

  try {
    trends = await getUSTrends();
    hn = await fetchHNTop(3);
    news = await fetchTechNews();
  } catch (e) {
    console.warn("⚠️ Using fallback data");
  }

  const context = { trends, hn, news };
  const { tweet, reply } = await generatePulse(context);

  try {
    const main = await postTweet(tweet);
    await postReply(main.data.id, reply);
    console.log("✅ Posted:", tweet);
  } catch (e) {
    console.error("❌ Posting failed:", e.message);
  }
}

//  Run every 4 hours
const INTERVAL = 4 * 60 * 60 * 1000; 

runPulse(); 
setInterval(runPulse, INTERVAL);