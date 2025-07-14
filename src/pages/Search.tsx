
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Clock, User, ArrowLeft } from "lucide-react";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_categories(name, slug)
        `)
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!query.trim()
  });

  const ArticleCard = ({ article }: { article: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
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
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {article.author && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{article.author}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(article.published_at), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{article.view_count}</span>
            </div>
          </div>
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
              <h1 className="text-3xl font-bold">Search Results</h1>
              <p className="text-primary-foreground/80">
                {query ? `Results for "${query}"` : 'Enter a search term'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!query.trim() ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">No Search Query</h2>
            <p className="text-muted-foreground mb-6">
              Please enter a search term to find articles.
            </p>
            <Button asChild>
              <Link to="/">Browse All News</Link>
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">Loading search results...</div>
        ) : searchResults && searchResults.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                Found {searchResults.length} article{searchResults.length !== 1 ? 's' : ''} matching "{query}"
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">No Results Found</h2>
            <p className="text-muted-foreground mb-6">
              No articles found matching "{query}". Try different keywords.
            </p>
            <Button asChild>
              <Link to="/">Browse All News</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
