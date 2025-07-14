
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Eye, Clock, User, ArrowRight, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import HeroCarousel from "@/components/HeroCarousel";
import SearchBar from "@/components/SearchBar";
import NewsletterSignup from "@/components/NewsletterSignup";
import SocialShare from "@/components/SocialShare";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  // Fetch featured articles for hero carousel
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

  // Fetch latest articles
  const { data: latestArticles, isLoading } = useQuery({
    queryKey: ['latest-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_categories(name, slug)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(12);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
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

  const ArticleCard = ({ article }: { article: any }) => (
    <Card className="hover:shadow-lg transition-shadow h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          {article.news_categories && (
            <Badge variant="secondary" className="text-xs">
              {article.news_categories.name}
            </Badge>
          )}
          {article.is_featured && <Badge variant="default">Featured</Badge>}
        </div>
        <CardTitle className="text-lg line-clamp-2">
          <Link 
            to={`/article/${article.slug}`}
            className="hover:text-primary transition-colors"
          >
            {article.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-between flex-1">
        <div>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
          <div className="flex items-center gap-4">
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
          <Button variant="outline" size="sm" asChild>
            <Link to={`/article/${article.slug}`}>Read More</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Kikao Kenya Newsfeed - Latest News from Kenya"
        description="Stay updated with the latest news from Kenya. Politics, Entertainment, Sports, Business and more."
      />
      
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold">
              Kikao Kenya Newsfeed
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="hover:text-primary-foreground/80 transition-colors">
                Home
              </Link>
              <Link to="/news" className="hover:text-primary-foreground/80 transition-colors">
                News
              </Link>
              {categories?.slice(0, 4).map((category) => (
                <Link 
                  key={category.id}
                  to={`/category/${category.slug}`} 
                  className="hover:text-primary-foreground/80 transition-colors capitalize"
                >
                  {category.name}
                </Link>
              ))}
              <Link to="/admin" className="hover:text-primary-foreground/80 transition-colors">
                <Settings className="h-4 w-4" />
              </Link>
            </nav>
            
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-secondary/50 py-4">
        <div className="container mx-auto px-4">
          <SearchBar />
        </div>
      </div>

      {/* Hero Carousel */}
      {featuredArticles && featuredArticles.length > 0 && (
        <section className="mb-12">
          <HeroCarousel articles={featuredArticles} />
        </section>
      )}

      <div className="container mx-auto px-4 py-8">
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
              <div className="text-center py-12">Loading latest news...</div>
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
                  Check back soon for the latest news updates.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories?.map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      className="block p-2 hover:bg-secondary rounded-md transition-colors capitalize"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

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
      </div>
    </div>
  );
};

export default Index;
