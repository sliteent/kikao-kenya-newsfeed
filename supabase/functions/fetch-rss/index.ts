
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
}

async function parseRSSFeed(url: string): Promise<RSSItem[]> {
  try {
    console.log(`Fetching RSS feed from: ${url}`);
    
    // Use CORS proxy for better reliability
    const CORS_PROXY = "https://api.allorigins.win/get?url=";
    const response = await fetch(CORS_PROXY + encodeURIComponent(url));
    const data = await response.json();
    
    if (!data.contents) {
      console.error('No contents received from CORS proxy');
      return [];
    }
    
    const xmlText = data.contents;
    console.log(`Received XML content length: ${xmlText.length}`);
    
    // Parse XML using DOMParser-like approach for Deno
    const items: RSSItem[] = []
    const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g) || []
    
    console.log(`Found ${itemMatches.length} items in RSS feed`);
    
    for (const itemXml of itemMatches) {
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                   itemXml.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || 
                         itemXml.match(/<description>(.*?)<\/description>/)?.[1] || ''
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      const guid = itemXml.match(/<guid.*?>(.*?)<\/guid>/)?.[1] || link
      
      // Filter for today's news
      const today = new Date().toDateString();
      const itemDate = pubDate ? new Date(pubDate).toDateString() : today;
      
      if (title && link && itemDate === today) {
        items.push({
          title: title.trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
          link: link.trim(),
          description: description.trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
          pubDate: pubDate.trim(),
          guid: guid.trim()
        })
      }
    }
    
    console.log(`Filtered ${items.length} items for today`);
    return items
  } catch (error) {
    console.error('Error parsing RSS feed:', error)
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting enhanced RSS fetch process...')

    // Get all active RSS sources
    const { data: rssSources, error: rssError } = await supabase
      .from('rss_sources')
      .select('*')
      .eq('is_active', true)

    if (rssError) {
      console.error('Error fetching RSS sources:', rssError)
      return new Response(JSON.stringify({ error: 'Failed to fetch RSS sources' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let totalProcessed = 0
    let totalInserted = 0
    const processedSources = []

    for (const source of rssSources || []) {
      console.log(`Processing RSS feed: ${source.name} - ${source.url}`)
      
      const items = await parseRSSFeed(source.url)
      console.log(`Found ${items.length} items for today from ${source.name}`)

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
          console.log(`Article already exists: ${item.title}`)
          continue // Skip duplicate
        }

        // Create article
        const slug = createSlug(item.title)
        const excerpt = extractExcerpt(item.description)
        
        const { error: insertError } = await supabase
          .from('news_articles')
          .insert({
            title: item.title,
            slug: `${slug}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content: item.description,
            excerpt,
            source_url: item.link,
            rss_guid: item.guid,
            category_id: source.category_id,
            status: 'published',
            author: source.name,
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
          })

        if (insertError) {
          console.error('Error inserting article:', insertError)
        } else {
          totalInserted++
          sourceInserted++
          console.log(`Inserted: ${item.title}`)
        }
      }

      // Update last_fetched timestamp
      await supabase
        .from('rss_sources')
        .update({ last_fetched: new Date().toISOString() })
        .eq('id', source.id)

      processedSources.push({
        name: source.name,
        url: source.url,
        items_found: items.length,
        items_inserted: sourceInserted
      })
    }

    console.log(`Enhanced RSS fetch completed. Processed: ${totalProcessed}, Inserted: ${totalInserted}`)

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully processed RSS feeds`,
      processed: totalProcessed, 
      inserted: totalInserted,
      sources: processedSources
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Enhanced RSS fetch error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
