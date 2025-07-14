
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Eye, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  // Fetch latest articles
  const { data: articles, isLoading } = useQuery({
    queryKey: ['news-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_categories(name, slug)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch featured articles
  const { data: featuredArticles } = useQuery({
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
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['news-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const ArticleCard = ({ article, featured = false }: { article: any, featured?: boolean }) => (
    <Card className={`hover:shadow-lg transition-shadow ${featured ? 'border-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          {article.news_categories && (
            <Badge variant="secondary" className="text-xs">
              {article.news_categories.name}
            </Badge>
          )}
          {featured && <Badge variant="default">Featured</Badge>}
        </div>
        <CardTitle className={`${featured ? 'text-xl' : 'text-lg'} line-clamp-2`}>
          <Link 
            to={`/article/${article.slug}`}
            className="hover:text-primary transition-colors"
          >
            {article.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {article.author && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{article.author}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(article.published_at), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{article.view_count}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading news...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Kikao Kenya Newsfeed</h1>
              <p className="text-primary-foreground/80">Your trusted source for Kenyan news</p>
            </div>
            <Button variant="secondary" asChild>
              <Link to="/admin">Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-secondary py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap">
              Home
            </Link>
            {categories?.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Section */}
        {featuredArticles && featuredArticles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded">Featured</span>
              Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} featured />
              ))}
            </div>
            <Separator className="mt-8" />
          </section>
        )}

        {/* Latest News */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded">Latest</span>
            News
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles?.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold mb-2">Kikao Kenya Newsfeed</h3>
          <p className="text-sm opacity-80">
            Powered by RSS feeds from trusted Kenyan news sources
          </p>
          <p className="text-xs opacity-60 mt-2">
            © 2024 Kikao Kenya Newsfeed. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
