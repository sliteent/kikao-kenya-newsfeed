
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Eye, Clock, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import HeroCarousel from "@/components/HeroCarousel";
import SearchBar from "@/components/SearchBar";
import NewsletterSignup from "@/components/NewsletterSignup";
import { useState } from "react";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        .limit(12);
      
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
    <Card className={`hover:shadow-lg transition-shadow h-full ${featured ? 'border-primary' : ''}`}>
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
              <span>{format(new Date(article.published_at), 'MMM dd, yyyy')}</span>
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
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-accent text-accent-foreground px-3 py-1 rounded font-bold text-xl">
                K
              </div>
              <div>
                <h1 className="text-xl font-bold">Kikao Kenya</h1>
                <p className="text-xs text-primary-foreground/80">Newsfeed</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="hover:text-accent transition-colors font-medium">
                Home
              </Link>
              <Link to="/news" className="hover:text-accent transition-colors font-medium">
                News
              </Link>
              {categories?.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="hover:text-accent transition-colors font-medium capitalize"
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            {/* Search & Admin */}
            <div className="hidden md:flex items-center space-x-4">
              <SearchBar />
              <Button variant="secondary" size="sm" asChild>
                <Link to="/admin">Admin</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="secondary"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-primary-foreground/20 py-4">
              <nav className="space-y-3">
                <Link
                  to="/"
                  className="block hover:text-accent transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/news"
                  className="block hover:text-accent transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  News
                </Link>
                {categories?.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className="block hover:text-accent transition-colors font-medium capitalize"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
                <div className="pt-3 border-t border-primary-foreground/20">
                  <SearchBar />
                </div>
                <Button variant="secondary" size="sm" asChild className="w-full">
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Carousel */}
      <HeroCarousel />

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Latest News Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded">Latest</span>
                  News
                </h2>
                <Button variant="outline" asChild>
                  <Link to="/news">View All</Link>
                </Button>
              </div>
              
              {isLoading ? (
                <div className="text-center py-12">Loading news...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {articles?.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Newsletter Signup */}
            <NewsletterSignup />
            
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
                      className="block hover:text-primary transition-colors text-sm font-medium capitalize"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AdSense Placeholder */}
            <Card>
              <CardContent className="p-6 text-center bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-2">Advertisement</p>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <p className="text-muted-foreground">AdSense Ad Space</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded font-bold text-xl">
                  K
                </div>
                <div>
                  <h3 className="text-lg font-bold">Kikao Kenya Newsfeed</h3>
                  <p className="text-sm opacity-80">Your trusted source for Kenyan news</p>
                </div>
              </div>
              <p className="text-sm opacity-80 max-w-md">
                Stay informed with the latest news, politics, entertainment, and sports from Kenya. 
                We bring you credible and timely news updates from trusted sources.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link to="/" className="block hover:text-primary transition-colors">Home</Link>
                <Link to="/news" className="block hover:text-primary transition-colors">News</Link>
                <Link to="/category/politics" className="block hover:text-primary transition-colors">Politics</Link>
                <Link to="/category/sports" className="block hover:text-primary transition-colors">Sports</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Categories</h4>
              <div className="space-y-2 text-sm">
                {categories?.slice(0, 5).map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className="block hover:text-primary transition-colors capitalize"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="text-center">
            <p className="text-sm opacity-80">
              © 2024 Kikao Kenya Newsfeed. All rights reserved. | 
              Powered by RSS feeds from trusted Kenyan news sources
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
