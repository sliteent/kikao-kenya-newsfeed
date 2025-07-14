
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RSSItem {
  title: string
  link: string
  description: string
  pubDate: string
  guid: string
  category?: string
  imageUrl?: string
}

interface NewsSource {
  name: string
  url: string
  categoryMapping: Record<string, string>
  parser: (xml: string) => RSSItem[]
}

const newsSources: NewsSource[] = [
  {
    name: 'Tuko.co.ke',
    url: 'https://www.tuko.co.ke/rss/all.xml',
    categoryMapping: { 'politics': 'Politics', 'entertainment': 'Entertainment', 'sports': 'Sports' },
    parser: parseStandardRSS
  },
  {
    name: 'Nation Media',
    url: 'https://nation.africa/kenya/rss',
    categoryMapping: { 'politics': 'Politics', 'business': 'Business', 'sports': 'Sports' },
    parser: parseStandardRSS
  },
  {
    name: 'Standard Media',
    url: 'https://www.standardmedia.co.ke/rss/headlines.xml',
    categoryMapping: { 'politics': 'Politics', 'business': 'Business', 'sports': 'Sports' },
    parser: parseStandardRSS
  },
  {
    name: 'Citizen Digital',
    url: 'https://citizentv.co.ke/feed/',
    categoryMapping: { 'politics': 'Politics', 'entertainment': 'Entertainment', 'sports': 'Sports' },
    parser: parseStandardRSS
  }
]

function parseStandardRSS(xmlText: string): RSSItem[] {
  try {
    const items: RSSItem[] = []
    const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g) || []
    
    for (const itemXml of itemMatches) {
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                   itemXml.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || 
                         itemXml.match(/<description>(.*?)<\/description>/)?.[1] || ''
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      const guid = itemXml.match(/<guid.*?>(.*?)<\/guid>/)?.[1] || link
      
      // Try to extract image from various possible locations
      const imageUrl = itemXml.match(/<media:content.*?url="([^"]*)".*?>/)?.[1] ||
                      itemXml.match(/<enclosure.*?url="([^"]*)".*?type="image\/.*?".*?>/)?.[1] ||
                      itemXml.match(/<image.*?url="([^"]*)".*?>/)?.[1] ||
                      description.match(/<img.*?src="([^"]*)".*?>/)?.[1] || ''
      
      if (title && link) {
        items.push({
          title: title.trim(),
          link: link.trim(),
          description: description.trim(),
          pubDate: pubDate.trim(),
          guid: guid.trim(),
          imageUrl: imageUrl.trim()
        })
      }
    }
    
    return items
  } catch (error) {
    console.error('Error parsing RSS feed:', error)
    return []
  }
}

async function fetchRSSFeed(url: string): Promise<RSSItem[]> {
  try {
    console.log(`Fetching RSS from: ${url}`)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const xmlText = await response.text()
    return parseStandardRSS(xmlText)
  } catch (error) {
    console.error(`Error fetching RSS from ${url}:`, error)
    return []
  }
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

function extractExcerpt(content: string): string {
  const cleanText = content.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ')
  return cleanText.substring(0, 200).trim() + (cleanText.length > 200 ? '...' : '')
}

function categorizeArticle(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase()
  
  if (text.includes('politics') || text.includes('government') || text.includes('parliament') || text.includes('president')) {
    return 'politics'
  } else if (text.includes('sports') || text.includes('football') || text.includes('rugby') || text.includes('athletics')) {
    return 'sports'
  } else if (text.includes('business') || text.includes('economy') || text.includes('market') || text.includes('finance')) {
    return 'business'
  } else if (text.includes('entertainment') || text.includes('celebrity') || text.includes('music') || text.includes('movie')) {
    return 'entertainment'
  } else if (text.includes('technology') || text.includes('tech') || text.includes('digital') || text.includes('internet')) {
    return 'technology'
  }
  
  return 'latest'
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

    console.log('Starting multi-source RSS fetch process...')

    let totalProcessed = 0
    let totalInserted = 0
    const processedSources: string[] = []

    // Get category mappings
    const { data: categories } = await supabase
      .from('news_categories')
      .select('*')

    const categoryMap = new Map()
    categories?.forEach(cat => {
      categoryMap.set(cat.slug, cat.id)
    })

    for (const source of newsSources) {
      try {
        console.log(`Processing source: ${source.name}`)
        
        const items = await fetchRSSFeed(source.url)
        console.log(`Found ${items.length} items from ${source.name}`)

        let sourceInserted = 0

        for (const item of items) {
          totalProcessed++

          // Check if article already exists
          const { data: existing } = await supabase
            .from('news_articles')
            .select('id')
            .eq('rss_guid', item.guid)
            .single()

          if (existing) {
            continue // Skip duplicate
          }

          // Determine category
          const categorySlug = categorizeArticle(item.title, item.description)
          const categoryId = categoryMap.get(categorySlug) || categoryMap.get('latest')

          // Create article
          const slug = createSlug(item.title)
          const excerpt = extractExcerpt(item.description)
          
          const { error: insertError } = await supabase
            .from('news_articles')
            .insert({
              title: item.title,
              slug: `${slug}-${Date.now()}`,
              content: item.description,
              excerpt,
              featured_image: item.imageUrl || null,
              source_url: item.link,
              rss_guid: item.guid,
              category_id: categoryId,
              status: 'published', // Auto-publish or set to 'pending' for approval
              author: source.name,
              published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
            })

          if (insertError) {
            console.error(`Error inserting article from ${source.name}:`, insertError)
          } else {
            sourceInserted++
            totalInserted++
            console.log(`Inserted from ${source.name}: ${item.title}`)
          }
        }

        processedSources.push(`${source.name}: ${sourceInserted} new articles`)
        
        // Update last_fetched timestamp for this source
        await supabase
          .from('rss_sources')
          .update({ last_fetched: new Date().toISOString() })
          .eq('name', source.name)
          
      } catch (sourceError) {
        console.error(`Error processing source ${source.name}:`, sourceError)
        processedSources.push(`${source.name}: Error - ${sourceError.message}`)
      }
    }

    console.log(`Multi-source RSS fetch completed. Total processed: ${totalProcessed}, Total inserted: ${totalInserted}`)

    return new Response(JSON.stringify({ 
      success: true, 
      processed: totalProcessed, 
      inserted: totalInserted,
      sources: processedSources,
      message: `Successfully processed ${newsSources.length} news sources`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Multi-source RSS fetch error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
