
-- Add likes table
CREATE TABLE public.article_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, article_id)
);

-- Add comments table
CREATE TABLE public.article_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add like_count and comment_count to news_articles for performance
ALTER TABLE public.news_articles 
ADD COLUMN like_count INTEGER DEFAULT 0,
ADD COLUMN comment_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for likes
CREATE POLICY "Users can view all likes" ON public.article_likes FOR SELECT USING (true);
CREATE POLICY "Users can like articles" ON public.article_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike their own likes" ON public.article_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for comments
CREATE POLICY "Users can view all comments" ON public.article_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.article_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.article_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.article_comments FOR DELETE USING (auth.uid() = user_id);

-- Function to update article counts
CREATE OR REPLACE FUNCTION update_article_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'article_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE news_articles SET like_count = like_count + 1 WHERE id = NEW.article_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE news_articles SET like_count = like_count - 1 WHERE id = OLD.article_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'article_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE news_articles SET comment_count = comment_count + 1 WHERE id = NEW.article_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE news_articles SET comment_count = comment_count - 1 WHERE id = OLD.article_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to update counts
CREATE TRIGGER update_like_count
  AFTER INSERT OR DELETE ON article_likes
  FOR EACH ROW EXECUTE FUNCTION update_article_counts();

CREATE TRIGGER update_comment_count
  AFTER INSERT OR DELETE ON article_comments
  FOR EACH ROW EXECUTE FUNCTION update_article_counts();

-- Update existing articles to have correct counts
UPDATE news_articles SET 
  like_count = (SELECT COUNT(*) FROM article_likes WHERE article_id = news_articles.id),
  comment_count = (SELECT COUNT(*) FROM article_comments WHERE article_id = news_articles.id);
