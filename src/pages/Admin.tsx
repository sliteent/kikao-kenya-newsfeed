
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Plus, Settings, BarChart } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const Admin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch articles for admin
  const { data: articles, isLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_categories(name, slug)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch RSS sources
  const { data: rssSources } = useQuery({
    queryKey: ['rss-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rss_sources')
        .select(`
          *,
          news_categories(name)
        `)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Manual RSS refresh
  const refreshRSS = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-rss');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "RSS Feed Updated",
        description: `Processed ${data.processed} items, inserted ${data.inserted} new articles`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: (error) => {
      toast({
        title: "RSS Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update article status
  const updateArticleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from('news_articles')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({
        title: "Article Updated",
        description: "Article status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle featured status
  const toggleFeatured = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string, is_featured: boolean }) => {
      const { error } = await supabase
        .from('news_articles')
        .update({ is_featured: !is_featured })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({
        title: "Featured Status Updated",
        description: "Article featured status has been updated",
      });
    }
  });

  const handleRefreshRSS = async () => {
    setIsRefreshing(true);
    try {
      await refreshRSS.mutateAsync();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      case 'archived': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-primary-foreground/80">Manage Kikao Kenya Newsfeed</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                onClick={handleRefreshRSS}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh RSS
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {articles?.filter(a => a.status === 'published').length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {articles?.filter(a => a.status === 'pending').length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                RSS Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rssSources?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* RSS Sources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              RSS Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rssSources?.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{source.name}</h3>
                    <p className="text-sm text-muted-foreground">{source.url}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {source.news_categories?.name || 'No Category'}
                      </Badge>
                      <Badge variant={source.is_active ? 'default' : 'secondary'}>
                        {source.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Last fetched: {source.last_fetched 
                        ? format(new Date(source.last_fetched), 'MMM dd, HH:mm')
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Articles Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Recent Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading articles...</div>
            ) : (
              <div className="space-y-4">
                {articles?.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(article.status)} text-white`}
                        >
                          {article.status}
                        </Badge>
                        {article.news_categories && (
                          <Badge variant="outline">
                            {article.news_categories.name}
                          </Badge>
                        )}
                        {article.is_featured && (
                          <Badge variant="default">Featured</Badge>
                        )}
                      </div>
                      
                      <h3 className="font-medium mb-1 line-clamp-1">{article.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Views: {article.view_count}</span>
                        <span>Created: {format(new Date(article.created_at), 'MMM dd, yyyy')}</span>
                        {article.published_at && (
                          <span>Published: {format(new Date(article.published_at), 'MMM dd, yyyy')}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleFeatured.mutate({ 
                          id: article.id, 
                          is_featured: article.is_featured 
                        })}
                      >
                        {article.is_featured ? 'Unfeature' : 'Feature'}
                      </Button>
                      
                      {article.status !== 'published' && (
                        <Button
                          size="sm"
                          onClick={() => updateArticleStatus.mutate({ 
                            id: article.id, 
                            status: 'published' 
                          })}
                        >
                          Publish
                        </Button>
                      )}
                      
                      {article.status === 'published' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateArticleStatus.mutate({ 
                            id: article.id, 
                            status: 'archived' 
                          })}
                        >
                          Archive
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
