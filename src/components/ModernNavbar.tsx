
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import RSSIcon from "./RSSIcon";

const ModernNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    { name: "Latest", slug: "latest" },
    { name: "Politics", slug: "politics" },
    { name: "Entertainment", slug: "entertainment" },
    { name: "Sports", slug: "sports" },
    { name: "Business", slug: "business" },
    { name: "Technology", slug: "technology" }
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">Kikao Kenya</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/news" 
              className="text-gray-700 hover:text-primary transition-colors"
            >
              All News
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/search">
                <Search className="h-4 w-4" />
              </Link>
            </Button>

            <Button variant="ghost" size="sm" asChild title="RSS Feeds">
              <Link to="/rss">
                <RSSIcon className="h-4 w-4 text-orange-500" />
              </Link>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/news"
                className="block px-3 py-2 text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                All News
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/category/${category.slug}`}
                  className="block px-3 py-2 text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                to="/rss"
                className="block px-3 py-2 text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                RSS Feeds
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ModernNavbar;
