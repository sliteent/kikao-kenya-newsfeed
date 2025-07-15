
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import News from "./pages/News";
import Article from "./pages/Article";
import Category from "./pages/Category";
import Search from "./pages/Search";
import Admin from "./pages/Admin";
import RSSInfo from "./pages/RSSInfo";
import NotFound from "./pages/NotFound";
import AdSense from "./components/AdSense";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AdSense />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/news" element={<News />} />
            <Route path="/article/:slug" element={<Article />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/search" element={<Search />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/rss" element={<RSSInfo />} />
            <Route path="/api/feed.xml" element={<FeedRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

// Component to redirect RSS feed requests to the edge function
const FeedRedirect = () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  const feedUrl = `https://bsqiylycebkxliggotxw.supabase.co/functions/v1/generate-rss${category ? `?category=${category}` : ''}`;
  
  window.location.href = feedUrl;
  return <div>Redirecting to RSS feed...</div>;
};

export default App;
