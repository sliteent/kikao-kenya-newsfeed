
import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  category?: string;
}

const SEOHead = ({
  title = "Kikao Kenya Newsfeed - Latest Kenyan News",
  description = "Stay informed with the latest news, politics, entertainment, and sports from Kenya. Your trusted source for credible and timely news updates.",
  image = "/placeholder.svg",
  url = "https://kikao-kenya-newsfeed.lovable.app",
  type = "website",
  publishedTime,
  author,
  category
}: SEOHeadProps) => {
  const siteName = "Kikao Kenya Newsfeed";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const baseUrl = "https://kikao-kenya-newsfeed.lovable.app";

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Basic Feed Discovery */}
      <link rel="alternate" type="application/atom+xml" title="Kikao Kenya Newsfeed" href={`${baseUrl}/feed.xml`} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_KE" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Article Specific Tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && category && (
        <meta property="article:section" content={category} />
      )}
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'article' ? "NewsArticle" : "WebSite",
          "name": fullTitle,
          "description": description,
          "url": url,
          ...(type === 'article' && {
            "headline": title,
            "image": image,
            "datePublished": publishedTime,
            "author": {
              "@type": "Person",
              "name": author || "Kikao Kenya Newsfeed"
            },
            "publisher": {
              "@type": "Organization",
              "name": siteName,
              "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/placeholder.svg`
              }
            }
          })
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;
