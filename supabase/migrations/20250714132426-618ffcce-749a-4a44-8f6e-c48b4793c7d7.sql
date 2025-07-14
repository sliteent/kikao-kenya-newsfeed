
-- Create news categories table
CREATE TABLE public.news_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news articles table
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  author TEXT,
  source_url TEXT,
  rss_guid TEXT UNIQUE,
  category_id UUID REFERENCES public.news_categories(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RSS sources table for managing multiple feeds
CREATE TABLE public.rss_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.news_categories(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_fetched TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add updated_at trigger for news_categories
CREATE TRIGGER update_news_categories_updated_at 
  BEFORE UPDATE ON public.news_categories 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for news_articles
CREATE TRIGGER update_news_articles_updated_at 
  BEFORE UPDATE ON public.news_articles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.news_categories (name, slug, description) VALUES
  ('Latest', 'latest', 'Latest news from Kenya'),
  ('Politics', 'politics', 'Political news and updates'),
  ('Entertainment', 'entertainment', 'Entertainment and celebrity news'),
  ('Sports', 'sports', 'Sports news and updates'),
  ('Business', 'business', 'Business and economic news'),
  ('Technology', 'technology', 'Technology and innovation news');

-- Insert default RSS source for Tuko.co.ke
INSERT INTO public.rss_sources (name, url, category_id) VALUES
  ('Tuko Latest', 'https://www.tuko.co.ke/rss/all.xml', 
   (SELECT id FROM public.news_categories WHERE slug = 'latest'));

-- Enable Row Level Security
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for news_categories
CREATE POLICY "Categories are viewable by everyone" 
  ON public.news_categories FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
  ON public.news_categories FOR ALL 
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- RLS Policies for news_articles
CREATE POLICY "Published articles are viewable by everyone" 
  ON public.news_articles FOR SELECT 
  USING (status = 'published');

CREATE POLICY "Admins can manage all articles" 
  ON public.news_articles FOR ALL 
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- RLS Policies for rss_sources
CREATE POLICY "Admins can view RSS sources" 
  ON public.rss_sources FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage RSS sources" 
  ON public.rss_sources FOR ALL 
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- Create indexes for better performance
CREATE INDEX idx_news_articles_status ON public.news_articles(status);
CREATE INDEX idx_news_articles_published_at ON public.news_articles(published_at DESC);
CREATE INDEX idx_news_articles_category ON public.news_articles(category_id);
CREATE INDEX idx_news_articles_slug ON public.news_articles(slug);
CREATE INDEX idx_news_articles_rss_guid ON public.news_articles(rss_guid);
CREATE INDEX idx_news_categories_slug ON public.news_categories(slug);
