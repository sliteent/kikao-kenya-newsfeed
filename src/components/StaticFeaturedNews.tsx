
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const StaticFeaturedNews = () => {
  const featuredNews = [
    {
      id: 1,
      title: "President Ruto Meets Governors Over Finance Bill Crisis",
      excerpt: "Ruto engages county leaders amid mounting opposition to the 2025 Finance Bill.",
      image: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=500&h=300&fit=crop",
      url: "https://www.tuko.co.ke/politics/123456-ruto-meets-governors/",
      source: "Tuko.co.ke"
    },
    {
      id: 2,
      title: "Nairobi Flash Floods Paralyze City Transport",
      excerpt: "Heavy rains cause widespread damage and traffic snarl-ups in major Nairobi roads.",
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500&h=300&fit=crop",
      url: "https://www.nation.africa/kenya/news/nairobi-floods-chaos-2025/",
      source: "Nation.africa"
    },
    {
      id: 3,
      title: "Safaricom Launches Free Internet Plan for Students",
      excerpt: "The telco's initiative targets rural schools with subsidized internet access across Kenya.",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=300&fit=crop",
      url: "https://www.standardmedia.co.ke/business-news/article/2001507890/safaricom-launches-free-internet-plan",
      source: "Standard Media"
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🔥 Featured News
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredNews.map((article) => (
          <Card key={article.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <div className="relative">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {article.source}
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center gap-1 text-blue-600 text-sm">
                  <ExternalLink className="h-3 w-3" />
                  <span>Read more</span>
                </div>
              </CardContent>
            </a>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default StaticFeaturedNews;
