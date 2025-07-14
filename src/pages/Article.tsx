
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Eye, Clock, User, ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect } from "react";

const Article = () => {
  const { slug } = useParams();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_categories(name, slug)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  // Increment view count
  useEffect(() => {
    if (article) {
      supabase
        .from('news_articles')
        .update({ view_count: article.view_count + 1 })
        .eq('id', article.id)
        .then(() => console.log('View count updated'));
    }
  }, [article]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading article...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Kikao Kenya Newsfeed</h1>
          </div>
        </div>
      </header>

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {article.news_categories && (
              <Badge variant="secondary">
                {article.news_categories.name}
              </Badge>
            )}
            {article.is_featured && <Badge variant="default">Featured</Badge>}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
            {article.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(article.published_at), 'MMMM dd, yyyy • HH:mm')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{article.view_count + 1} views</span>
            </div>
          </div>

          {article.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 font-medium">
              {article.excerpt}
            </p>
          )}

          <Separator />
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-8">
          <div
            dangerouslySetInnerHTML={{ __html: article.content || '' }}
            className="text-foreground leading-relaxed"
          />
        </div>

        {/* Source Link */}
        {article.source_url && (
          <div className="bg-secondary/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Original source:</p>
            <Button variant="outline" size="sm" asChild>
              <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Read full article
              </a>
            </Button>
          </div>
        )}
      </article>
    </div>
  );
};

export default Article;
