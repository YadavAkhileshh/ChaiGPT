// utils/gemini.js
import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// ✅ Use gemini-1.0-pro — available everywhere, no region locks
const MODEL = "gemini-1.5-flash-latest";

export const generatePulse = async (context) => {
  const prompt = `You are @ChaiGPT — a witty tech enthusiast who creates viral tweets mixing Hindi/English, loves roasting tech trends, and drops truth bombs.

Today: ${new Date().toDateString()}
Trending: ${context.news.map(n => `"${n.title}"`).join('; ')}

Create:
1. Main tweet (≤240 chars): Catchy, relatable, mix Hindi/English, use trending hashtags, end with ☕/🤖/🔥/💀
2. Reply: Hot take or deeper insight that sparks discussion

Style: Think viral Twitter - controversial but fun, tech-savvy but accessible

Output JSON:
{
  "tweet": "string",
  "reply": "string"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 400,
            temperature: 0.8,
            topP: 0.9
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Gemini ${response.status}: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text || "";
    
    const jsonStr = text
      .replace(/```json\n?|\n?```/g, '')
      .replace(/"/g, '\\"') // escape inner quotes
      .trim();

    // Try parsing, fallback if invalid
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.warn("⚠️ Invalid JSON, cleaning...");
      // Extract tweet & reply via regex (robust fallback)
      const tweetMatch = text.match(/"tweet"\s*:\s*"([^"]+)"/i);
      const replyMatch = text.match(/"reply"\s*:\s*"([^"]+)"/i);
      return {
        tweet: tweetMatch ? tweetMatch[1].slice(0, 240) : "Tech bros be like: 'AI will replace everything' Meanwhile AI: *can't even parse JSON properly* 🤖",
        reply: replyMatch ? replyMatch[1] : "Plot twist: The real AI was the bugs we made along the way 💀 #TechReality"
      };
    }
  } catch (e) {
    console.error("❌ Gemini failed:", e.message);
    return {
      tweet: `Breaking: ${context.news[0]?.title?.slice(0, 100) || 'Tech world'} Meanwhile me: *still debugging Hello World* 💀`,
      reply: "Sometimes I wonder if I'm an AI or just a very sophisticated autocorrect 🤖 #TechLife"
    };
  }
};