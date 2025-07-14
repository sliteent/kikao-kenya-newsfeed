
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Plus, Trash2, Edit, BarChart } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Admin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    category_id: '',
    featured_image: ''
  });

  // Fetch articles
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

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Enhanced RSS refresh for multiple sources
  const refreshRSS = useMutation({
    mutationFn: async () => {
      console.log('Starting multi-source RSS fetch...');
      const { data, error } = await supabase.functions.invoke('fetch-multiple-sources');
      console.log('Multi-source RSS fetch response:', data, error);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('Multi-source RSS fetch successful:', data);
      toast({
        title: "News Updated Successfully",
        description: `${data.message}. Added ${data.inserted} new articles from ${data.sources?.length || 'multiple'} sources.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setHasAutoFetched(true);
    },
    onError: (error) => {
      console.error('Multi-source RSS fetch error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to fetch from news sources",
        variant: "destructive",
      });
    }
  });

  // Auto-fetch RSS when page loads if no articles exist (silently in background)
  useEffect(() => {
    if (!isLoading && articles && articles.length === 0 && !hasAutoFetched) {
      console.log('No articles found, auto-fetching RSS in background...');
      refreshRSS.mutate();
    }
  }, [articles, isLoading, hasAutoFetched]);

  // Create new post
  const createPost = useMutation({
    mutationFn: async (postData: any) => {
      const slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);

      const { error } = await supabase
        .from('news_articles')
        .insert({
          ...postData,
          slug: `${slug}-${Date.now()}`,
          status: 'published',
          published_at: new Date().toISOString()
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Post Created",
        description: "Your article has been published successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setIsAddingPost(false);
      setNewPost({ title: '', content: '', excerpt: '', category_id: '', featured_image: '' });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete post
  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Post Deleted",
        description: "Article has been removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
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

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content || !newPost.category_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, content, and category",
        variant: "destructive",
      });
      return;
    }
    createPost.mutate(newPost);
  };

  // Show loading state only for initial page load
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Admin Panel</h2>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Content Management</h1>
              <p className="text-primary-foreground/80">Manage Kikao Kenya Newsfeed - Multi-Source Aggregation</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                onClick={handleRefreshRSS}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Update from All Sources
              </Button>
              
              <Dialog open={isAddingPost} onOpenChange={setIsAddingPost}>
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input 
                      placeholder="Article Title"
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    />
                    <Select 
                      value={newPost.category_id} 
                      onValueChange={(value) => setNewPost({...newPost, category_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input 
                      placeholder="Featured Image URL (optional)"
                      value={newPost.featured_image}
                      onChange={(e) => setNewPost({...newPost, featured_image: e.target.value})}
                    />
                    <Textarea 
                      placeholder="Article Excerpt"
                      value={newPost.excerpt}
                      onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
                      rows={3}
                    />
                    <Textarea 
                      placeholder="Article Content"
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                      rows={10}
                    />
                    <Button onClick={handleCreatePost} className="w-full">
                      Publish Article
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Stats */}
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
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {articles?.reduce((sum, a) => sum + a.view_count, 0) || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Auto-Sync Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-green-600">
                ✓ Multi-Source Active
              </div>
              <div className="text-xs text-muted-foreground">
                Tuko, Nation, Standard, Citizen
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              All Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {articles && articles.length > 0 ? (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
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
                        <span>Published: {article.published_at ? format(new Date(article.published_at), 'MMM dd, yyyy') : 'Not published'}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletePost.mutate(article.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {refreshRSS.isPending ? 'Fetching latest news in background...' : 'No articles found. Click "Update from All Sources" to fetch the latest news.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
