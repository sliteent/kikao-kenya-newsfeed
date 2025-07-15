
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import ArticleCard from "./ArticleCard";

const FeaturedArticles = () => {
  const { data: featuredArticles, isLoading } = useQuery({
    queryKey: ['featured-articles'],
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
        .limit(6);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Featured Articles
          </h2>
          <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!featuredArticles || featuredArticles.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Featured Articles
          </h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No Featured Articles Yet</h3>
            <p className="text-muted-foreground mb-4">
              Check back later for featured content from our editors.
            </p>
            <Button asChild>
              <Link to="/news">Browse All News</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-500" />
          Featured Articles
        </h2>
        <Button variant="outline" asChild>
          <Link to="/news">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredArticles.map((article) => (
          <ArticleCard key={article.id} article={article} featured={true} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedArticles;
