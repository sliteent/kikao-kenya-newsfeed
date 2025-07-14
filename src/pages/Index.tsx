
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, ArrowRight, Menu, X } from "lucide-react";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const featuredNews = {
    title: "President Ruto Announces New Infrastructure Development Plan",
    excerpt: "The government unveils a comprehensive plan to modernize Kenya's infrastructure, focusing on digital connectivity and sustainable transport systems.",
    image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Politics",
    readTime: "5 min read",
    author: "John Kamau"
  };

  const newsArticles = [
    {
      id: 1,
      title: "New Tax Reforms Announced in Parliament",
      excerpt: "The National Assembly passed the Finance Bill 2025 with significant tax reforms aimed at boosting economic growth and reducing the burden on small businesses.",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "Politics",
      readTime: "3 min read",
      author: "Mary Wanjiku"
    },
    {
      id: 2,
      title: "Top Kenyan Artist Launches New Album",
      excerpt: "Thousands gather in Nairobi to celebrate the much-anticipated release of the latest album by one of Kenya's most celebrated musicians.",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "Entertainment",
      readTime: "4 min read",
      author: "Peter Otieno"
    },
    {
      id: 3,
      title: "Football League Kicks Off with Surprises",
      excerpt: "The FKF Premier League season opens with unexpected results and promising performances from emerging teams.",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "Sports",
      readTime: "2 min read",
      author: "James Ochieng"
    },
    {
      id: 4,
      title: "Kenya's Tech Sector Shows Remarkable Growth",
      excerpt: "New data reveals that Kenya's technology sector has grown by 15% this year, positioning the country as a regional tech hub.",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "Business",
      readTime: "6 min read",
      author: "Grace Muthoni"
    },
    {
      id: 5,
      title: "Wildlife Conservation Efforts Show Success",
      excerpt: "Kenya's wildlife conservation programs report significant increases in endangered species populations across national parks.",
      image: "https://images.unsplash.com/photo-1549366021-9f761d040a94?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "Environment",
      readTime: "4 min read",
      author: "David Kiprop"
    },
    {
      id: 6,
      title: "Education Reforms Transform Rural Schools",
      excerpt: "Government's new education initiative brings modern learning facilities and digital resources to rural communities across Kenya.",
      image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "Education",
      readTime: "5 min read",
      author: "Sarah Njeri"
    }
  ];

  const navItems = ["Home", "Politics", "Business", "Entertainment", "Sports", "Contact"];

  const getCategoryColor = (category: string) => {
    const colors = {
      Politics: "bg-red-100 text-red-800",
      Entertainment: "bg-purple-100 text-purple-800",
      Sports: "bg-blue-100 text-blue-800",
      Business: "bg-green-100 text-green-800",
      Environment: "bg-emerald-100 text-emerald-800",
      Education: "bg-orange-100 text-orange-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="bg-[#004d40] text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold">DailyKikao</div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-[#4db6ac] transition-colors duration-200 font-medium"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#00695c] transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden pb-4 animate-fade-in">
              {navItems.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block py-2 px-4 hover:bg-[#00695c] rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#00796b] to-[#004d40] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Breaking News: Stay Updated with DailyKikao
              </h1>
              <p className="text-xl mb-6 text-gray-100">
                Your reliable source for Kenyan news and insights
              </p>
              <Button className="bg-white text-[#004d40] hover:bg-gray-100 font-semibold px-8 py-3 rounded-full transition-all duration-200 hover:scale-105">
                Read Latest News
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </div>
            
            {/* Featured News Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <img
                  src={featuredNews.image}
                  alt="Featured news"
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-6">
                  <Badge className={`mb-3 ${getCategoryColor(featuredNews.category)}`}>
                    {featuredNews.category}
                  </Badge>
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {featuredNews.title}
                  </h3>
                  <p className="text-gray-200 text-sm mb-4">
                    {featuredNews.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-gray-300 space-x-4">
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      {featuredNews.author}
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {featuredNews.readTime}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* News Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Latest News</h2>
          <div className="w-20 h-1 bg-[#00796b] rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsArticles.map((article, index) => (
            <Card
              key={article.id}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer animate-fade-in"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <Badge
                    className={`absolute top-4 left-4 ${getCategoryColor(article.category)}`}
                  >
                    {article.category}
                  </Badge>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-[#00796b] transition-colors duration-200 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User size={14} className="mr-1" />
                        {article.author}
                      </div>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {article.readTime}
                      </div>
                    </div>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button className="bg-[#00796b] hover:bg-[#004d40] text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105">
            Load More Stories
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#004d40] text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">DailyKikao</h3>
              <p className="text-gray-300 text-sm">
                Kenya's trusted source for news, insights, and stories that matter.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Politics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sports</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Entertainment</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <p className="text-gray-300 text-sm mb-4">
                Stay connected for the latest updates
              </p>
              <div className="space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Facebook</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Twitter</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-8 pt-8 text-center">
            <p className="text-gray-300 text-sm">
              © 2025 DailyKikao. Built by Samuel Theuri. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
