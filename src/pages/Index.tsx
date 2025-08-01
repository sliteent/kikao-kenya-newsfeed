
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ModernNavbar from "@/components/ModernNavbar";
import ModernHero from "@/components/ModernHero";
import TrendingTopics from "@/components/TrendingTopics";
import NewsletterSignup from "@/components/NewsletterSignup";
import SocialShare from "@/components/SocialShare";
import SEOHead from "@/components/SEOHead";
import TodayNews from "@/components/TodayNews";
import FeaturedArticles from "@/components/FeaturedArticles";
import StaticFeaturedNews from "@/components/StaticFeaturedNews";
import RSSFeaturedNews from "@/components/RSSFeaturedNews";
import ArticleCard from "@/components/ArticleCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        
        {/* RSS Featured News Section */}
        <RSSFeaturedNews />
        
        {/* Static Featured News Section */}
        <StaticFeaturedNews />
        
        {/* Dynamic Featured Articles Section */}
        <FeaturedArticles />
        
        {/* Today's News Section */}
        <section className="mb-12">
          <TodayNews />
        </section>
        
        {/* Trending Topics */}
        <TrendingTopics />
        
        {/* Latest News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">All News Archive</h2>
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
                <h3 className="text-lg font-semibold mb-4">No Archive Articles Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Check today's news section above for the latest updates.
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
            
            {/* RSS Feed Card */}
            <Card>
              <CardHeader>
                <CardTitle>RSS Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Subscribe to our RSS feed to get the latest news delivered to your RSS reader.
                </p>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <a 
                    href="/feed.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Subscribe to RSS
                  </a>
                </Button>
              </CardContent>
            </Card>
            
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
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Kikao Kenya Newsfeed</h3>
              <p className="text-muted-foreground text-sm">
                Your trusted source for the latest news from Kenya and around the world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/news" className="text-muted-foreground hover:text-primary">All News</Link></li>
                <li><Link to="/category/politics" className="text-muted-foreground hover:text-primary">Politics</Link></li>
                <li><Link to="/category/business" className="text-muted-foreground hover:text-primary">Business</Link></li>
                <li><Link to="/category/sports" className="text-muted-foreground hover:text-primary">Sports</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">RSS Feed</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="/feed.xml" 
                    className="text-muted-foreground hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Subscribe to RSS
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Kikao Kenya Newsfeed. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
