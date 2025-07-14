
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Eye, Clock, User, ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import SocialShare from "@/components/SocialShare";
import NewsletterSignup from "@/components/NewsletterSignup";

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

  // Fetch related articles
  const { data: relatedArticles } = useQuery({
    queryKey: ['related-articles', article?.category_id],
    queryFn: async () => {
      if (!article?.category_id) return [];
      
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_categories(name, slug)
        `)
        .eq('status', 'published')
        .eq('category_id', article.category_id)
        .neq('id', article.id)
        .order('published_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    },
    enabled: !!article?.category_id
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

  const currentUrl = window.location.href;

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
            <div className="flex items-center space-x-2">
              <div className="bg-accent text-accent-foreground px-2 py-1 rounded font-bold">
                K
              </div>
              <h1 className="text-xl font-bold">Kikao Kenya Newsfeed</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Article Content */}
          <article className="lg:col-span-3">
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
                <p className="text-lg text-muted-foreground leading-relaxed mb-6 font-medium border-l-4 border-primary pl-4 italic">
                  {article.excerpt}
                </p>
              )}

              <Separator className="mb-6" />
            </header>

            {/* Featured Image */}
            {article.featured_image && (
              <div className="mb-8">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <div
                dangerouslySetInnerHTML={{ __html: article.content || '' }}
                className="text-foreground leading-relaxed"
              />
            </div>

            {/* Social Share */}
            <div className="mb-8">
              <SocialShare title={article.title} url={currentUrl} />
            </div>

            {/* Source Link */}
            {article.source_url && (
              <div className="bg-secondary/50 p-6 rounded-lg mb-8">
                <p className="text-sm text-muted-foreground mb-3">Original source:</p>
                <Button variant="outline" size="sm" asChild>
                  <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Read full article
                  </a>
                </Button>
              </div>
            )}

            {/* AdSense Placeholder */}
            <Card className="mb-8">
              <CardContent className="p-6 text-center bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-2">Advertisement</p>
                <div className="h-32 bg-muted rounded flex items-center justify-center">
                  <p className="text-muted-foreground">AdSense Ad Space</p>
                </div>
              </CardContent>
            </Card>

            {/* Related Articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedArticles.map((relatedArticle) => (
                    <Card key={relatedArticle.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <Badge variant="outline" className="mb-2">
                          {relatedArticle.news_categories?.name}
                        </Badge>
                        <h4 className="font-semibold mb-2 line-clamp-2">
                          <Link
                            to={`/article/${relatedArticle.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {relatedArticle.title}
                          </Link>
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {relatedArticle.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{format(new Date(relatedArticle.published_at), 'MMM dd')}</span>
                          <span>{relatedArticle.view_count} views</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Newsletter Signup */}
            <NewsletterSignup />

            {/* AdSense Placeholder */}
            <Card>
              <CardContent className="p-6 text-center bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-2">Advertisement</p>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <p className="text-muted-foreground">AdSense Ad Space</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Article;
