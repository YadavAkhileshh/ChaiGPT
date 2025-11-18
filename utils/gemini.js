import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
//  Use gemini-1.0-pro — available everywhere, no region locks
const MODEL = "gemini-1.5-flash-latest";

const getRandomStyle = () => {
  const styles = [
    "controversial hot take",
    "relatable struggle story", 
    "unpopular opinion",
    "asking provocative questions",
    "roasting tech culture",
    "humble bragging",
    "conspiracy theory vibes"
  ];
  return styles[Math.floor(Math.random() * styles.length)];
};

export const generatePulse = async (context) => {
  const style = getRandomStyle();
  const timestamp = Date.now();
  
  const prompt = `You are a viral tech Twitter personality (style: ${style}). Create ENGAGING content that gets replies, retweets, and arguments.

News: ${context.news.map(n => n.title).slice(0,2).join(' | ')}
Trends: ${context.trends.slice(0,3).join(', ')}

Craft VIRAL tweets (timestamp: ${timestamp}):

 ENGAGEMENT TACTICS:
- Ask controversial questions
- Share unpopular opinions
- Use "hot take:" or "unpopular opinion:"
- Create "me vs everyone else" scenarios
- Reference current drama/trends
- Use thread hooks ("🧵 thread")
- Add poll-worthy statements

 WRITING STYLE:
- Mix Hindi/English naturally (bhai, yaar, bas, kya)
- Use Gen Z slang (fr, ngl, lowkey, highkey, periodt)
- Include relatable struggles
- Self-deprecating humor
- Controversial but harmless takes
- End with engaging emoji

 VIRAL EXAMPLES:
- "hot take: [controversial opinion about tech trend] 🔥"
- "am I the only one who thinks [popular thing] is overrated? 💀"
- "tech twitter will hate me for this but... [spicy take] ☕"
- "normalize admitting that [relatable struggle] 😭"
- "[news] happened and tech bros are acting like [funny observation] 🤡"

Create 1 main tweet + 1 reply that will get people talking!

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
            temperature: 0.9,
            topP: 0.95
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
      
      const fallbackTweets = [
        "hot take: most 'senior developers' are just junior devs who got really good at googling 🔥",
        "am I the only one who thinks coding bootcamps are just expensive YouTube playlists? 💀",
        "normalize admitting you copy-paste from Stack Overflow and have no idea how it works 😭",
        "tech bros: 'this will disrupt everything!' me: bhai it's just CRUD with extra steps ☕",
        "unpopular opinion: 90% of startups are just existing apps with different colors 🤡",
        "everyone's building AI while I'm here wondering why my div won't center 😵‍💫"
      ];
      
      const fallbackReplies = [
        "fight me in the comments if you disagree 😤",
        "tell me I'm wrong (you can't) 😏",
        "this tweet will age like milk but whatever 🤷‍♂️",
        "tech twitter gonna be mad at this one fr 😅",
        "ratio me if you think I'm lying 💯",
        "change my mind (spoiler: you won't) 🧐"
      ];
      
      const randomTweet = fallbackTweets[Math.floor(Math.random() * fallbackTweets.length)];
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      
      return {
        tweet: tweetMatch ? tweetMatch[1].slice(0, 240) : randomTweet,
        reply: replyMatch ? replyMatch[1] : randomReply
      };
    }
  } catch (e) {
    console.error("❌ Gemini failed:", e.message);
    
    const emergencyTweets = [
      `hot take: ${context.news[0]?.title?.slice(0, 80) || 'all these AI breakthroughs'} but we still can't fix JavaScript 🔥`,
      "unpopular opinion: most 'game-changing' tech is just marketing hype with extra steps 💀",
      "am I the only one who thinks tech conferences are just expensive networking events? ☕",
      "normalize admitting that half of programming is just trial and error until something works 😭",
      "tech twitter: 'this changes everything!' me: bhai it's Tuesday, calm down 😵💫"
    ];
    
    const emergencyReplies = [
      "fight me in the comments, I have time today 😤",
      "this is the hill I'm dying on periodt 💯",
      "tech bros gonna be pressed about this one ngl 😅",
      "ratio me if you think I'm wrong (spoiler: I'm not) 😏",
      "change my mind challenge: impossible difficulty 🧐"
    ];
    
    return {
      tweet: emergencyTweets[Math.floor(Math.random() * emergencyTweets.length)],
      reply: emergencyReplies[Math.floor(Math.random() * emergencyReplies.length)]
    };
  }
};