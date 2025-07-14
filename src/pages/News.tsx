
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Eye, Clock, User, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import NewsletterSignup from "@/components/NewsletterSignup";

const ARTICLES_PER_PAGE = 12;

const News = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch total count
  const { data: totalCount } = useQuery({
    queryKey: ['news-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('news_articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch paginated articles
  const { data: articles, isLoading } = useQuery({
    queryKey: ['news-articles', currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * ARTICLES_PER_PAGE;
      const to = from + ARTICLES_PER_PAGE - 1;
      
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_categories(name, slug)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      return data;
    }
  });

  const totalPages = Math.ceil((totalCount || 0) / ARTICLES_PER_PAGE);

  const ArticleCard = ({ article }: { article: any }) => (
    <Card className="hover:shadow-lg transition-shadow h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          {article.news_categories && (
            <Badge variant="secondary" className="text-xs">
              {article.news_categories.name}
            </Badge>
          )}
          {article.is_featured && <Badge variant="default">Featured</Badge>}
        </div>
        <CardTitle className="text-lg line-clamp-2">
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
              <span>{format(new Date(article.published_at), 'MMM dd')}</span>
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
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">All News</h1>
              <p className="text-primary-foreground/80">Latest news from Kenya</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">Loading articles...</div>
            ) : articles && articles.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    Showing {((currentPage - 1) * ARTICLES_PER_PAGE) + 1} - {Math.min(currentPage * ARTICLES_PER_PAGE, totalCount || 0)} of {totalCount} articles
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <span className="text-sm text-muted-foreground mx-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">No Articles Found</h2>
                <p className="text-muted-foreground mb-6">
                  There are no published articles yet.
                </p>
                <Button asChild>
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
