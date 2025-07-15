
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html>
      <head>
        <title><xsl:value-of select="rss/channel/title"/></title>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .item { border-bottom: 1px solid #eee; padding: 20px 0; }
          .item:last-child { border-bottom: none; }
          .item-title { font-size: 1.2em; font-weight: bold; margin-bottom: 5px; }
          .item-title a { color: #333; text-decoration: none; }
          .item-title a:hover { color: #007bff; }
          .item-meta { color: #666; font-size: 0.9em; margin-bottom: 10px; }
          .item-description { color: #555; }
          .feed-info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1><xsl:value-of select="rss/channel/title"/></h1>
          <p><xsl:value-of select="rss/channel/description"/></p>
          <p><strong>Website:</strong> <a href="{rss/channel/link}"><xsl:value-of select="rss/channel/link"/></a></p>
        </div>
        
        <div class="feed-info">
          <h3>📡 RSS Feed</h3>
          <p>This is an RSS feed. Copy the URL to subscribe in your RSS reader.</p>
          <p><strong>What is RSS?</strong> RSS allows you to subscribe to website updates and read them in your preferred RSS reader app.</p>
        </div>
        
        <div class="articles">
          <xsl:for-each select="rss/channel/item">
            <div class="item">
              <div class="item-title">
                <a href="{link}" target="_blank">
                  <xsl:value-of select="title"/>
                </a>
              </div>
              <div class="item-meta">
                Published: <xsl:value-of select="pubDate"/>
                <xsl:if test="author"> | Author: <xsl:value-of select="author"/></xsl:if>
                <xsl:if test="category"> | Category: <xsl:value-of select="category"/></xsl:if>
              </div>
              <div class="item-description">
                <xsl:value-of select="description"/>
              </div>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
