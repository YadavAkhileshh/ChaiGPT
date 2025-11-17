// utils/data-sources.js
import fetch from 'node-fetch';
import RSSParser from 'rss-parser';

export const fetchHNTop = async (n = 3) => {
  try {
    const ids = await (await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')).json();
    const stories = [];
    for (let id of ids.slice(0, n)) {
      const item = await (await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)).json();
      if (item?.title && item?.url) {
        stories.push({ title: item.title, url: item.url });
      }
    }
    return stories;
  } catch (e) {
    console.error('❌ HN fetch failed:', e.message);
    return [];
  }
};

export const fetchTechNews = async () => {
  try {
    const parser = new RSSParser(); // ✅ Direct usage
    const feed = await parser.parseURL(
      'https://news.google.com/rss/search?q=tech+AI+startup&hl=en-US&gl=US&ceid=US:en'
    );
    return feed.items?.slice(0, 3).map(item => ({ title: item.title })) || [];
  } catch (e) {
    console.error('❌ RSS fetch failed:', e.message);
    return [];
  }
};