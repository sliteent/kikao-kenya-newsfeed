
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MessageCircle, User, Send, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CommentsSectionProps {
  articleId: string;
}

const CommentsSection = ({ articleId }: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ['article-comments', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('article_comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!articleId
  });

  // Check current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to comment",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('article_comments')
        .insert({
          article_id: articleId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ['article-comments', articleId] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully"
      });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('article_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-comments', articleId] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed"
      });
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      });
    }
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    addCommentMutation.mutate(newComment);
  };

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            placeholder={user ? "Share your thoughts..." : "Please sign in to comment"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!user || isSubmitting}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!user || !newComment.trim() || isSubmitting}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>

        {/* Comments List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 bg-secondary/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      User {comment.user_id.slice(-6)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  {user && user.id === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentsSection;
