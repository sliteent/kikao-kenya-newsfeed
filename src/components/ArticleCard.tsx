
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Heart, MessageCircle, Eye, Clock, User, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface ArticleCardProps {
  article: any;
  featured?: boolean;
}

const ArticleCard = ({ article, featured = false }: ArticleCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has liked this article
  const { data: userLike } = useQuery({
    queryKey: ['user-like', article.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('article_likes')
        .select('*')
        .eq('article_id', article.id)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!article.id
  });

  // Update local state when query data changes
  useState(() => {
    setIsLiked(!!userLike);
  }, [userLike]);

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to like articles",
          variant: "destructive"
        });
        return;
      }

      if (isLiked) {
        const { error } = await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('article_likes')
          .insert({
            article_id: article.id,
            user_id: user.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ['user-like', article.id] });
      queryClient.invalidateQueries({ queryKey: ['latest-articles-by-category'] });
      queryClient.invalidateQueries({ queryKey: ['today-news'] });
      queryClient.invalidateQueries({ queryKey: ['featured-articles'] });
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    }
  });

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    likeMutation.mutate();
  };

  const cardClasses = featured 
    ? "hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5"
    : "hover:shadow-lg transition-all duration-300 group cursor-pointer";

  return (
    <Card className={cardClasses}>
      <Link to={`/article/${article.slug}`}>
        <div className="relative">
          {article.featured_image && (
            <div className={`aspect-video overflow-hidden rounded-t-lg ${featured ? 'aspect-[16/9]' : ''}`}>
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
            
            <h3 className={`font-bold group-hover:text-primary transition-colors mb-2 ${featured ? 'text-xl' : 'text-lg'} line-clamp-2`}>
              {article.title}
            </h3>
            
            {article.excerpt && (
              <p className={`text-muted-foreground mb-4 ${featured ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'}`}>
                {article.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-3">
                {article.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{article.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(article.published_at), 'MMM dd, HH:mm')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{article.view_count}</span>
                </div>
              </div>
              
              {article.source_url && (
                <a 
                  href={article.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors text-blue-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Source</span>
                </a>
              )}
            </div>

            {/* Like and Comment buttons */}
            <div className="flex items-center gap-4 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{article.like_count || 0}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-muted-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Comments functionality will be handled in article page
                }}
              >
                <MessageCircle className="h-4 w-4" />
                <span>{article.comment_count || 0}</span>
              </Button>
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
};

export default ArticleCard;
