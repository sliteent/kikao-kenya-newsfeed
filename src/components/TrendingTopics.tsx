
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Hash } from "lucide-react";
import { Link } from "react-router-dom";

const TrendingTopics = () => {
  const { data: trendingCategories } = useQuery({
    queryKey: ['trending-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_categories')
        .select(`
          *,
          news_articles(id, view_count)
        `)
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Calculate trending score based on article count and views
      const categoriesWithStats = data.map(category => {
        const articles = category.news_articles || [];
        const totalViews = articles.reduce((sum: number, article: any) => sum + article.view_count, 0);
        const articleCount = articles.length;
        
        return {
          ...category,
          totalViews,
          articleCount,
          trendingScore: totalViews + (articleCount * 10)
        };
      });
      
      return categoriesWithStats
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 6);
    }
  });

  const { data: popularArticles } = useQuery({
    queryKey: ['popular-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          id,
          title,
          slug,
          view_count,
          published_at,
          news_categories(name, slug)
        `)
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Trending Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trending Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {trendingCategories?.map((category) => (
              <Link key={category.id} to={`/category/${category.slug}`}>
                <Badge 
                  variant="secondary" 
                  className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer py-2 px-3"
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {category.name}
                  <span className="ml-2 text-xs bg-primary/20 px-1 rounded">
                    {category.articleCount}
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Most Popular Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-500" />
            Most Popular
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {popularArticles?.map((article, index) => (
              <Link key={article.id} to={`/article/${article.slug}`}>
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {article.news_categories && (
                        <>
                          <span>{article.news_categories.name}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{article.view_count} views</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingTopics;
