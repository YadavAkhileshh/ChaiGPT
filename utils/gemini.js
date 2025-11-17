// utils/gemini.js
import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// ✅ Use gemini-1.0-pro — available everywhere, no region locks
const MODEL = "gemini-1.5-flash-latest";

export const generatePulse = async (context) => {
  const prompt = `You are a real human tech enthusiast on Twitter. Write like actual people tweet - casual, relatable, sometimes sarcastic.

News: ${context.news.map(n => `"${n.title}"`).join('; ')}

Create human-like tweets:
1. Main tweet (≤240 chars): 
   - Use everyday language, not corporate speak
   - Add personal opinions/reactions
   - Mix Hindi words naturally (bhai, yaar, kya, etc)
   - Use common abbreviations (tbh, ngl, fr)
   - Include relatable struggles/observations
   - End with single emoji that fits

2. Reply: Continue the thought like you're chatting with friends

Examples of human style:
- "ngl this AI hype is getting out of hand bhai 😅"
- "me: gonna learn React today. also me: *watches Netflix* 🤡"
- "tech bros be like 'this will change everything' meanwhile I can't even center a div 💀"

Be authentic, not promotional. Sound like a real person, not a bot.

JSON:
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
        tweet: tweetMatch ? tweetMatch[1].slice(0, 240) : "me: gonna build the next big app today. also me: *spends 3 hours fixing CSS alignment* 🤡",
        reply: replyMatch ? replyMatch[1] : "why is programming 10% coding and 90% googling error messages tbh 😅"
      };
    }
  } catch (e) {
    console.error("❌ Gemini failed:", e.message);
    return {
      tweet: `saw this news: ${context.news[0]?.title?.slice(0, 80) || 'some tech thing'} meanwhile I'm here googling "how to exit vim" for the 100th time 😭`,
      reply: "ngl being a developer is just copying code from stackoverflow and pretending you understand it 😅"
    };
  }
};