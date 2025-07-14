
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Clock, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ModernNavbar from "@/components/ModernNavbar";
import ModernHero from "@/components/ModernHero";
import TrendingTopics from "@/components/TrendingTopics";
import NewsletterSignup from "@/components/NewsletterSignup";
import SocialShare from "@/components/SocialShare";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  // Fetch latest articles by category
  const { data: latestArticles, isLoading } = useQuery({
    queryKey: ['latest-articles-by-category'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_categories(name, slug)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(16);
      
      if (error) throw error;
      return data;
    }
  });

  const ArticleCard = ({ article }: { article: any }) => (
    <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
      <Link to={`/article/${article.slug}`}>
        <div className="relative">
          {article.featured_image && (
            <div className="aspect-video overflow-hidden rounded-t-lg">
              <img 
                src={article.featured_image} 
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              {article.news_categories && (
                <Badge variant="secondary" className="text-xs">
                  {article.news_categories.name}
                </Badge>
              )}
              {article.is_featured && (
                <Badge variant="default" className="text-xs">Featured</Badge>
              )}
            </div>
            
            <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors mb-2">
              {article.title}
            </h3>
            
            {article.excerpt && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {article.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                {article.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{article.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(article.published_at), 'MMM dd')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{article.view_count}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Kikao Kenya Newsfeed - Latest News from Kenya"
        description="Stay updated with the latest news from Kenya. Politics, Entertainment, Sports, Business and more from trusted sources."
      />
      
      <ModernNavbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <ModernHero />
        
        {/* Trending Topics */}
        <TrendingTopics />
        
        {/* Latest News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Latest News</h2>
              <Button variant="outline" asChild>
                <Link to="/news">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
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
            ) : latestArticles && latestArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {latestArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-4">No Articles Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Fresh news updates are being fetched. Check back soon!
                </p>
                <Button asChild>
                  <Link to="/admin">Manage Content</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <NewsletterSignup />
            
            {/* AdSense Placeholder */}
            <Card>
              <CardContent className="p-6 text-center bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-2">Advertisement</p>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <p className="text-muted-foreground">Google AdSense</p>
                </div>
              </CardContent>
            </Card>

            {/* Social Share */}
            <Card>
              <CardHeader>
                <CardTitle>Follow Us</CardTitle>
              </CardHeader>
              <CardContent>
                <SocialShare 
                  url="https://kikao-kenya-newsfeed.lovable.app"
                  title="Kikao Kenya Newsfeed - Latest News from Kenya"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-secondary/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 Kikao Kenya Newsfeed. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
