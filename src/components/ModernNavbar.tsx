
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Search, 
  Settings, 
  Home, 
  Newspaper, 
  TrendingUp,
  Globe,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ModernNavbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { data: categories } = useQuery({
    queryKey: ['navbar-categories'],
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const mainNavItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Latest", path: "/news", icon: Newspaper },
    { name: "Politics", path: "/category/politics", icon: Globe },
    { name: "Sports", path: "/category/sports", icon: TrendingUp },
    { name: "Business", path: "/category/business", icon: Zap },
    { name: "Entertainment", path: "/category/entertainment", icon: TrendingUp },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-bold">
              K
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">Kikao Kenya</h1>
              <p className="text-xs text-muted-foreground">News & Updates</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden"
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button type="submit" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </form>

            {/* Admin Link */}
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="py-6">
                  <div className="space-y-4">
                    {mainNavItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-secondary"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    ))}
                    
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-2 px-4">Categories</h3>
                      {categories?.map((category) => (
                        <Link
                          key={category.id}
                          to={`/category/${category.slug}`}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden py-4 border-t">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ModernNavbar;
