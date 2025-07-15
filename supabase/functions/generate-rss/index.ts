
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/rss+xml; charset=UTF-8'
}

function formatRSSDate(date: string): string {
  return new Date(date).toUTCString()
}

function generateRSSFeed(articles: any[], siteTitle: string, siteDescription: string, categorySlug?: string): string {
  const baseUrl = 'https://kikao-kenya-newsfeed.lovable.app'
  const feedUrl = categorySlug ? `${baseUrl}/feed.xml?category=${categorySlug}` : `${baseUrl}/feed.xml`
  
  const rssItems = articles.map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/article/${article.slug}</link>
      <description><![CDATA[${article.excerpt || article.content?.substring(0, 200) + '...' || ''}]]></description>
      <pubDate>${formatRSSDate(article.published_at)}</pubDate>
      <guid>${baseUrl}/article/${article.slug}</guid>
      ${article.author ? `<author>${article.author}</author>` : ''}
      ${article.news_categories?.name ? `<category>${article.news_categories.name}</category>` : ''}
      ${article.featured_image ? `<enclosure url="${article.featured_image}" type="image/jpeg" length="0"/>` : ''}
      ${article.source_url ? `<source url="${article.source_url}">Original Source</source>` : ''}
    </item>
  `).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${baseUrl}/rss-style.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteTitle}</title>
    <link>${baseUrl}</link>
    <description><![CDATA[${siteDescription}]]></description>
    <language>en-ke</language>
    <lastBuildDate>${formatRSSDate(new Date().toISOString())}</lastBuildDate>
    <generator>Kikao Kenya Newsfeed RSS Generator</generator>
    <webMaster>admin@kikao-kenya-newsfeed.lovable.app</webMaster>
    <managingEditor>admin@kikao-kenya-newsfeed.lovable.app</managingEditor>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/placeholder.svg</url>
      <title>${siteTitle}</title>
      <link>${baseUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    ${rssItems}
  </channel>
</rss>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const categorySlug = url.searchParams.get('category')
    
    let query = supabase
      .from('news_articles')
      .select(`
        *,
        news_categories(name, slug)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20)

    // Filter by category if specified
    if (categorySlug) {
      const { data: category } = await supabase
        .from('news_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()
      
      if (category) {
        query = query.eq('category_id', category.id)
      }
    }

    const { data: articles, error } = await query

    if (error) {
      console.error('Error fetching articles:', error)
      return new Response('Error generating RSS feed', { status: 500 })
    }

    const siteTitle = categorySlug 
      ? `Kikao Kenya Newsfeed - ${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}`
      : 'Kikao Kenya Newsfeed'
    
    const siteDescription = categorySlug
      ? `Latest ${categorySlug} news from Kenya and around the world.`
      : 'Latest news updates from Kenya and around the world.'

    const rssXml = generateRSSFeed(articles || [], siteTitle, siteDescription, categorySlug)

    return new Response(rssXml, {
      headers: corsHeaders
    })

  } catch (error) {
    console.error('RSS generation error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})
