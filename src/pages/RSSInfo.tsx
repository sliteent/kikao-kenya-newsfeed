
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Rss } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const RSSInfo = () => {
  const baseUrl = "https://kikao-kenya-newsfeed.lovable.app";
  
  const feeds = [
    {
      title: "All News",
      url: `${baseUrl}/api/feed.xml`,
      description: "Complete news feed with all articles"
    },
    {
      title: "Politics",
      url: `${baseUrl}/api/feed.xml?category=politics`,
      description: "Political news and updates"
    },
    {
      title: "Business",
      url: `${baseUrl}/api/feed.xml?category=business`,
      description: "Business and economic news"
    },
    {
      title: "Sports",
      url: `${baseUrl}/api/feed.xml?category=sports`,
      description: "Sports news and updates"
    },
    {
      title: "Entertainment",
      url: `${baseUrl}/api/feed.xml?category=entertainment`,
      description: "Entertainment and lifestyle news"
    },
    {
      title: "Technology",
      url: `${baseUrl}/api/feed.xml?category=technology`,
      description: "Tech news and innovations"
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Feed URL copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="RSS Feeds - Kikao Kenya Newsfeed"
        description="Subscribe to RSS feeds for latest news from Kenya. Get updates on politics, business, sports, entertainment and more."
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Rss className="h-8 w-8 text-orange-500" />
              <h1 className="text-3xl font-bold">RSS Feeds</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Stay updated with our RSS feeds. Subscribe to get the latest news delivered to your RSS reader.
            </p>
          </div>

          {/* What is RSS */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rss className="h-5 w-5 text-orange-500" />
                What is RSS?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                RSS (Really Simple Syndication) is a web feed format that allows you to subscribe to website updates 
                and read them in your preferred RSS reader application. Instead of visiting multiple websites, 
                you can get all your news in one place.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Popular RSS Readers:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Feedly</li>
                    <li>• Inoreader</li>
                    <li>• NewsBlur</li>
                    <li>• The Old Reader</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Benefits:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• No ads or distractions</li>
                    <li>• Read offline</li>
                    <li>• Organize by categories</li>
                    <li>• Never miss updates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Feeds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feeds.map((feed, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{feed.title}</CardTitle>
                    <Badge variant="secondary">RSS</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{feed.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-muted p-3 rounded-lg">
                      <code className="text-sm break-all">{feed.url}</code>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(feed.url)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <a href={feed.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Preview
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How to Subscribe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Step 1: Choose an RSS Reader</h4>
                  <p className="text-muted-foreground text-sm">
                    Download an RSS reader app or use a web-based service like Feedly or Inoreader.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Step 2: Add Feed URL</h4>
                  <p className="text-muted-foreground text-sm">
                    Copy one of the feed URLs above and paste it into your RSS reader's "Add Feed" or "Subscribe" section.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Step 3: Enjoy!</h4>
                  <p className="text-muted-foreground text-sm">
                    Your RSS reader will automatically check for new articles and notify you when they're published.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button asChild>
              <Link to="/">← Back to News</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSSInfo;
