
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
    const response = await fetch(url)
    const xmlText = await response.text()
    
    // Simple XML parsing for RSS items
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
      
      if (title && link) {
        items.push({
          title: title.trim(),
          link: link.trim(),
          description: description.trim(),
          pubDate: pubDate.trim(),
          guid: guid.trim()
        })
      }
    }
    
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

    console.log('Starting RSS fetch process...')

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

    for (const source of rssSources || []) {
      console.log(`Processing RSS feed: ${source.name}`)
      
      const items = await parseRSSFeed(source.url)
      console.log(`Found ${items.length} items in ${source.name}`)

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

        // Create article
        const slug = createSlug(item.title)
        const excerpt = extractExcerpt(item.description)
        
        const { error: insertError } = await supabase
          .from('news_articles')
          .insert({
            title: item.title,
            slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
            content: item.description,
            excerpt,
            source_url: item.link,
            rss_guid: item.guid,
            category_id: source.category_id,
            status: 'published',
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
          })

        if (insertError) {
          console.error('Error inserting article:', insertError)
        } else {
          totalInserted++
          console.log(`Inserted: ${item.title}`)
        }
      }

      // Update last_fetched timestamp
      await supabase
        .from('rss_sources')
        .update({ last_fetched: new Date().toISOString() })
        .eq('id', source.id)
    }

    console.log(`RSS fetch completed. Processed: ${totalProcessed}, Inserted: ${totalInserted}`)

    return new Response(JSON.stringify({ 
      success: true, 
      processed: totalProcessed, 
      inserted: totalInserted 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('RSS fetch error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
