
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface RSSItem {
  title: string;
  link: string;
  contentSnippet: string;
  pubDate: string;
  creator?: string;
}

const RSSFeaturedNews = () => {
  const [rssItems, setRssItems] = useState<RSSItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRSSFeed = async () => {
      try {
        // Using a more reliable CORS proxy
        const CORS_PROXY = "https://corsproxy.io/?";
        const feedUrl = "https://www.tuko.co.ke/rss";
        
        const response = await fetch(`${CORS_PROXY}${encodeURIComponent(feedUrl)}`);
        const data = await response.text();
        
        // Parse RSS using DOMParser (built-in browser API)
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'text/xml');
        
        const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, 3).map(item => ({
          title: item.querySelector('title')?.textContent || '',
          link: item.querySelector('link')?.textContent || '',
          contentSnippet: item.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '').slice(0, 120) + '...' || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          creator: item.querySelector('creator')?.textContent || 'Tuko'
        }));
        
        setRssItems(items);
      } catch (err) {
        console.error('Error fetching RSS feed:', err);
        setError('RSS feed temporarily unavailable');
        
        // Fallback to static content if RSS fails
        const fallbackItems = [
          {
            title: "Kenya's Latest Political Developments",
            link: "https://www.tuko.co.ke/politics",
            contentSnippet: "Stay updated with the latest political news and developments across Kenya...",
            pubDate: new Date().toISOString(),
            creator: "Tuko"
          },
          {
            title: "Breaking Business News",
            link: "https://www.tuko.co.ke/business",
            contentSnippet: "Latest business trends and economic updates from Kenya and East Africa...",
            pubDate: new Date().toISOString(),
            creator: "Tuko"
          },
          {
            title: "Sports Updates",
            link: "https://www.tuko.co.ke/sports",
            contentSnippet: "Get the latest sports news and updates from Kenyan and international sports...",
            pubDate: new Date().toISOString(),
            creator: "Tuko"
          }
        ];
        setRssItems(fallbackItems);
      }
    };

    fetchRSSFeed();
  }, []);

  if (error && rssItems.length === 0) {
    return (
      <section className="featured-articles">
        <h2>🔥 Featured News</h2>
        <div className="featured-grid">
          <div className="text-center text-red-500 col-span-full">
            RSS feed temporarily unavailable. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-articles">
      <h2>🔥 Featured News</h2>
      <div className="featured-grid">
        {rssItems.map((item, index) => (
          <article key={index} className="featured-item">
            <img 
              src="https://via.placeholder.com/400x200?text=News+Image" 
              alt="News Image"
              className="w-full h-[180px] object-cover"
            />
            <h3>
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#e60000] no-underline hover:underline"
              >
                {item.title}
              </a>
            </h3>
            <p className="text-[#555] text-[15px] px-3 pb-[15px]">
              {item.contentSnippet}
            </p>
            <div className="flex items-center gap-1 text-blue-600 text-sm px-3 pb-3">
              <ExternalLink className="h-3 w-3" />
              <span>Read more</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RSSFeaturedNews;
