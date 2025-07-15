
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

interface RSSFeed {
  items: RSSItem[];
}

const RSSFeaturedNews = () => {
  const [rssItems, setRssItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRSSFeed = async () => {
      try {
        const CORS_PROXY = "https://api.allorigins.win/get?url=";
        const feedUrl = encodeURIComponent("https://www.tuko.co.ke/rss");
        
        const response = await fetch(`${CORS_PROXY}${feedUrl}`);
        const data = await response.json();
        
        // Parse RSS using DOMParser (built-in browser API)
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
        
        const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, 3).map(item => ({
          title: item.querySelector('title')?.textContent || '',
          link: item.querySelector('link')?.textContent || '',
          contentSnippet: item.querySelector('description')?.textContent?.slice(0, 120) + '...' || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          creator: item.querySelector('creator')?.textContent || 'Tuko'
        }));
        
        setRssItems(items);
      } catch (err) {
        console.error('Error fetching RSS feed:', err);
        setError('Failed to load RSS feed');
      } finally {
        setLoading(false);
      }
    };

    fetchRSSFeed();
  }, []);

  if (loading) {
    return (
      <section className="featured-articles">
        <h2>🔥 Featured News</h2>
        <div className="featured-grid">
          {[1, 2, 3].map(i => (
            <Card key={i} className="featured-item animate-pulse">
              <div className="w-full h-[180px] bg-gray-200"></div>
              <CardContent className="p-3">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-articles">
        <h2>🔥 Featured News</h2>
        <div className="featured-grid">
          <div className="text-center text-red-500 col-span-full">
            {error}
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
