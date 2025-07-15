
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const StaticFeaturedNews = () => {
  const featuredNews = [
    {
      id: 1,
      title: "President Ruto Orders Police to Shoot Violent Protesters in the Leg",
      excerpt: "Ruto's latest directive aims to curb protests by disabling rather than killing demonstrators after weeks of chaos.",
      image: "https://cdn.reuters.com/resizer/.../kenya-protests.jpg",
      url: "https://www.reuters.com/world/africa/kenyas-president-orders-police-shoot-violent-protesters-leg-2025-07-09/?utm_source=chatgpt.com",
      source: "Reuters"
    },
    {
      id: 2,
      title: "Death Toll from Kenya's Protests Rises to 31",
      excerpt: "UN condemns Kenya's crackdown as over 30 killed, many by live bullets, during anti-government demonstrations.",
      image: "https://media.apnews.com/.../kenya-victims.jpg",
      url: "https://apnews.com/article/ca186b6c54e92852161a61b3d3f4c508?utm_source=chatgpt.com",
      source: "AP News"
    },
    {
      id: 3,
      title: "Nairobi Locked Down Amid Mass Clashes",
      excerpt: "The capital city was sealed off as security forces battled youth-led protests across more than a dozen counties.",
      image: "https://static.politico.com/.../nairobi-lockdown.jpg",
      url: "https://www.politico.com/news/2025/07/07/nairobi-is-locked-down-as-kenyan-police-clash-with-protesters-00441970?utm_source=chatgpt.com",
      source: "Politico"
    },
    {
      id: 4,
      title: "President Ruto orders police to shoot protesters in the leg",
      excerpt: "Ruto urges police to disable—not kill—violators amid criticism over force during deadly protests.",
      image: "https://example.com/images/ruto-leg-shoot.jpg",
      url: "https://www.reuters.com/world/africa/kenyas-president-orders-police-shoot-violent-protesters-leg-2025-07-09/",
      source: "Reuters",
      category: "Politics"
    },
    {
      id: 5,
      title: "Photos: Funeral of civilian shot by police during protest",
      excerpt: "Boniface Kariuki, killed during anti‑police demo, laid to rest—a case fueling calls for police restraint.",
      image: "https://example.com/images/kariuki-funeral.jpg",
      url: "https://apnews.com/article/fc7676d5cc436f6c2a5501b3044f4ada",
      source: "AP News",
      category: "Kenya"
    },
    {
      id: 6,
      title: "Kenya Airways adds Gatwick–Nairobi flights",
      excerpt: "Three weekly night flights from Gatwick boost tourism and UK connectivity.",
      image: "https://example.com/images/uk-nairobi-flights.jpg",
      url: "https://www.thesun.co.uk/travel/35493269/",
      source: "The Sun",
      category: "Business & Economy"
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Politics':
        return 'bg-red-500';
      case 'Kenya':
        return 'bg-green-500';
      case 'Business & Economy':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🔥 Featured News - July 15, 2025
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
                {article.category && (
                  <div className={`absolute top-2 left-2 ${getCategoryColor(article.category)} text-white px-2 py-1 rounded text-xs font-medium`}>
                    {article.category}
                  </div>
                )}
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
