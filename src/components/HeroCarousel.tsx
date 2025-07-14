
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Clock, Eye } from "lucide-react";

interface HeroCarouselProps {
  articles: any[];
}

const HeroCarousel = ({ articles }: HeroCarouselProps) => {
  if (!articles?.length) {
    return null;
  }

  return (
    <section className="relative mb-12">
      <Carousel className="w-full">
        <CarouselContent>
          {articles.map((article) => (
            <CarouselItem key={article.id}>
              <Card className="border-0 rounded-lg overflow-hidden">
                <div className="relative h-[400px] md:h-[500px]">
                  {article.featured_image ? (
                    <img 
                      src={article.featured_image} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      {article.news_categories && (
                        <Badge variant="secondary" className="bg-primary text-primary-foreground">
                          {article.news_categories.name}
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-white/30 text-white">
                        Trending
                      </Badge>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 line-clamp-2">
                      <Link 
                        to={`/article/${article.slug}`}
                        className="hover:text-primary-foreground/80 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h2>
                    
                    {article.excerpt && (
                      <p className="text-white/90 text-lg mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-white/80">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(article.published_at), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{article.view_count} views</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  );
};

export default HeroCarousel;
