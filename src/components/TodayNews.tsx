
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Clock, User, ExternalLink, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

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

  const ArticleCard = ({ article }: { article: any }) => (
    <Card className="hover:shadow-lg transition-all duration-300 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {article.news_categories?.name || 'Latest'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {article.author || 'Kenya News'}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              <a 
                href={article.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {article.title}
              </a>
            </h3>
            
            {article.excerpt && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                {article.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(article.published_at), 'HH:mm')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{article.view_count}</span>
                </div>
              </div>
              <a 
                href={article.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors text-blue-600"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Read at source</span>
              </a>
            </div>
          </div>
          
          {article.featured_image && (
            <div className="w-24 h-24 flex-shrink-0">
              <img 
                src={article.featured_image} 
                alt={article.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
                <Badge variant="outline">{articles.length} articles</Badge>
              </div>
              <div className="space-y-3">
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
