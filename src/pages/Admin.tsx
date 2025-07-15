
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Plus, Trash2, BarChart, Loader2, Edit, Eye } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  featured_image: z.string().optional(),
  is_featured: z.boolean().default(false),
});

const Admin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [isPublishingManual, setIsPublishingManual] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      category_id: "",
      featured_image: "",
      is_featured: false,
    },
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

  // Create/Update article
  const createArticleMutation = useMutation({
    mutationFn: async (values: z.infer<typeof articleSchema>) => {
      const slug = values.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);

      const articleData = {
        ...values,
        slug: editingPost ? editingPost.slug : `${slug}-${Date.now()}`,
        status: 'published',
        published_at: new Date().toISOString(),
        author: 'Admin',
      };

      if (editingPost) {
        const { error } = await supabase
          .from('news_articles')
          .update(articleData)
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('news_articles')
          .insert(articleData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: editingPost ? "Article Updated" : "Article Created",
        description: `Your article has been ${editingPost ? 'updated' : 'published'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setIsAddingPost(false);
      setEditingPost(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: editingPost ? "Update Failed" : "Creation Failed",
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

  // Create sample articles
  const publishSampleArticles = useMutation({
    mutationFn: async () => {
      const sampleArticles = [
        {
          title: "Kenya's Tech Industry Reaches New Heights in 2024",
          content: "Kenya's technology sector has experienced unprecedented growth this year, with local startups securing over $200 million in funding. The country continues to position itself as the Silicon Savannah of Africa, attracting international investors and fostering innovation across fintech, agritech, and healthtech sectors. Major companies like Safaricom and Equity Bank have launched new digital initiatives that are transforming how Kenyans interact with technology in their daily lives.",
          excerpt: "Kenya's tech sector secures record funding as the country solidifies its position as Africa's Silicon Savannah.",
          category_id: categories?.find(cat => cat.slug === 'technology')?.id || categories?.[0]?.id,
          featured_image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop",
          is_featured: true,
          author: "Tech Reporter",
        },
        {
          title: "Harambee Stars Advance to AFCON Semi-Finals",
          content: "In a thrilling match that kept fans on the edge of their seats, Kenya's national football team, Harambee Stars, secured their place in the AFCON semi-finals with a 2-1 victory over Nigeria. The team's stellar performance has united the country and renewed hope for Kenya's football future. Coach Engin Firat's tactical brilliance and the players' determination have created magic on the pitch.",
          excerpt: "Harambee Stars make history with a stunning victory over Nigeria to reach AFCON semi-finals.",
          category_id: categories?.find(cat => cat.slug === 'sports')?.id || categories?.[0]?.id,
          featured_image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
          is_featured: true,
          author: "Sports Desk",
        },
        {
          title: "New Education Reforms Transform Kenyan Schools",
          content: "The Ministry of Education has successfully implemented comprehensive reforms that are revolutionizing education in Kenya. The new Competency-Based Curriculum (CBC) is now showing positive results, with students demonstrating improved critical thinking skills and practical application of knowledge. Teachers have embraced digital learning tools, and infrastructure improvements have reached rural areas, ensuring equitable access to quality education.",
          excerpt: "Revolutionary education reforms show promising results as Kenya embraces modern learning approaches.",
          category_id: categories?.find(cat => cat.slug === 'latest')?.id || categories?.[0]?.id,
          featured_image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
          is_featured: false,
          author: "Education Correspondent",
        },
      ];

      let insertedCount = 0;
      for (const article of sampleArticles) {
        const slug = article.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 100);

        const { error } = await supabase
          .from('news_articles')
          .insert({
            ...article,
            slug: `${slug}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            status: 'published',
            published_at: new Date().toISOString(),
            rss_guid: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          });

        if (!error) {
          insertedCount++;
        }
      }
      return { inserted: insertedCount, total: sampleArticles.length };
    },
    onSuccess: (data) => {
      toast({
        title: "Sample Articles Published",
        description: `Successfully published ${data.inserted} sample articles`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: (error) => {
      toast({
        title: "Publishing Failed",
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

  const handlePublishSampleArticles = async () => {
    setIsPublishingManual(true);
    try {
      await publishSampleArticles.mutateAsync();
    } finally {
      setIsPublishingManual(false);
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    form.reset({
      title: post.title,
      content: post.content || "",
      excerpt: post.excerpt || "",
      category_id: post.category_id || "",
      featured_image: post.featured_image || "",
      is_featured: post.is_featured || false,
    });
    setIsAddingPost(true);
  };

  const onSubmit = (values: z.infer<typeof articleSchema>) => {
    createArticleMutation.mutate(values);
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
              <p className="text-primary-foreground/80">Manage Kikao Kenya Newsfeed</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="secondary" 
                onClick={handleRefreshRSS}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Update RSS
              </Button>

              <Button 
                variant="secondary" 
                onClick={handlePublishSampleArticles}
                disabled={isPublishingManual}
              >
                {isPublishingManual ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Sample Articles
              </Button>
              
              <Dialog open={isAddingPost} onOpenChange={(open) => {
                setIsAddingPost(open);
                if (!open) {
                  setEditingPost(null);
                  form.reset();
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    Write Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPost ? 'Edit Article' : 'Write New Article'}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter article title..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories?.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="featured_image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Featured Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="excerpt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Excerpt</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief description of the article..." 
                                rows={3} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Write your article content here..." 
                                rows={15} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_featured"
                          checked={form.watch('is_featured')}
                          onChange={(e) => form.setValue('is_featured', e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="is_featured" className="text-sm font-medium">
                          Mark as Featured Article
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" disabled={createArticleMutation.isPending}>
                          {createArticleMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          {editingPost ? 'Update Article' : 'Publish Article'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsAddingPost(false);
                            setEditingPost(null);
                            form.reset();
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
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
                Featured
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {articles?.filter(a => a.is_featured).length || 0}
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
              <div className="text-2xl font-bold text-purple-600">
                {articles?.reduce((sum, a) => sum + a.view_count, 0) || 0}
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
                  <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
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
                          <Badge variant="default" className="bg-yellow-600">
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold mb-1 line-clamp-1">{article.title}</h3>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {article.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Views: {article.view_count}</span>
                        <span>Likes: {article.like_count || 0}</span>
                        <span>Comments: {article.comment_count || 0}</span>
                        <span>Published: {article.published_at ? format(new Date(article.published_at), 'MMM dd, yyyy') : 'Draft'}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPost(article)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/article/${article.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
                <p className="text-muted-foreground mb-4">No articles found yet.</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setIsAddingPost(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Write Your First Article
                  </Button>
                  <Button onClick={handlePublishSampleArticles} disabled={isPublishingManual} variant="outline">
                    {isPublishingManual ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add Sample Articles
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
