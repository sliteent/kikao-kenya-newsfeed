
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import ArticleCard from "./ArticleCard";

const TodayNews = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: todayArticles, isLoading, refetch } = useQuery({
    queryKey: ['today-news'],
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_categories(name, slug)
        `)
        .eq('status', 'published')
        .gte('published_at', startOfDay.toISOString())
        .lt('published_at', endOfDay.toISOString())
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Auto-fetch news on component mount
  useEffect(() => {
    const autoFetchNews = async () => {
      if (!todayArticles || todayArticles.length === 0) {
        await fetchLatestNews();
      }
    };
    
    autoFetchNews();
  }, []);

  const fetchLatestNews = async () => {
    setIsRefreshing(true);
    try {
      console.log('Fetching latest news from Kenyan sources...');
      const response = await supabase.functions.invoke('fetch-multiple-sources');
      if (response.error) throw response.error;
      console.log('News fetch response:', response.data);
      refetch(); // Refresh the articles after fetching
    } catch (error) {
      console.error('Error fetching latest news:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Group articles by source
  const groupedArticles = todayArticles?.reduce((acc, article) => {
    const source = article.author || 'Kenya News';
    if (!acc[source]) acc[source] = [];
    acc[source].push(article);
    return acc;
  }, {} as Record<string, any[]>) || {};

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Today's Kenya News</h2>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Today's Kenya News</h2>
        <Button 
          onClick={fetchLatestNews} 
          variant="outline" 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Fetching...' : 'Refresh News'}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        Latest articles from: Tuko.co.ke, Nation.africa, Standard Media, Citizen Digital, Kenyans.co.ke, The Star
      </div>

      {Object.keys(groupedArticles).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No articles for today yet</h3>
            <p className="text-muted-foreground mb-4">
              Click "Refresh News" to fetch the latest articles from Kenyan news sources.
            </p>
            <Button onClick={fetchLatestNews} disabled={isRefreshing}>
              {isRefreshing ? 'Fetching...' : 'Fetch Today\'s News'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedArticles).map(([source, articles]) => (
            <div key={source} className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-primary">{source}</h3>
                <span className="text-sm text-muted-foreground">({articles.length} articles)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayNews;
