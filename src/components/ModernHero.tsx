
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Clock, Eye, TrendingUp } from "lucide-react";

const ModernHero = () => {
  const { data: featuredArticles } = useQuery({
    queryKey: ['hero-featured-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_categories(name, slug)
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: latestArticles } = useQuery({
    queryKey: ['hero-latest-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_categories(name, slug)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  const mainArticle = featuredArticles?.[0] || latestArticles?.[0];
  const sideArticles = latestArticles?.slice(1, 4) || [];

  if (!mainArticle) {
    return (
      <div className="w-full h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground mb-2">Latest News Loading...</h2>
          <p className="text-muted-foreground">Fresh updates coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      {/* Main Featured Article */}
      <div className="lg:col-span-2">
        <Card className="overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300">
          <Link to={`/article/${mainArticle.slug}`}>
            <div className="relative">
              {mainArticle.featured_image ? (
                <img 
                  src={mainArticle.featured_image} 
                  alt={mainArticle.title}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-80 bg-gradient-to-br from-primary/20 to-accent/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-red-600 text-white border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    BREAKING
                  </Badge>
                  {mainArticle.news_categories && (
                    <Badge variant="outline" className="border-white/30 text-white">
                      {mainArticle.news_categories.name}
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold mb-3 line-clamp-2 group-hover:text-primary-foreground transition-colors">
                  {mainArticle.title}
                </h1>
                
                {mainArticle.excerpt && (
                  <p className="text-white/90 text-lg mb-4 line-clamp-2">
                    {mainArticle.excerpt}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(mainArticle.published_at), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{mainArticle.view_count} views</span>
                  </div>
                  {mainArticle.author && (
                    <span>by {mainArticle.author}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </Card>
      </div>

      {/* Side Articles */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending Now
        </h2>
        
        {sideArticles.map((article, index) => (
          <Card key={article.id} className="group cursor-pointer hover:shadow-lg transition-all duration-200">
            <Link to={`/article/${article.slug}`}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {article.news_categories && (
                        <Badge variant="secondary" className="text-xs">
                          {article.news_categories.name}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                      {article.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(article.published_at), 'MMM dd')}</span>
                      <span>•</span>
                      <span>{article.view_count} views</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModernHero;
