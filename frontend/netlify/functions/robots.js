exports.handler = async (event, context) => {
  const baseUrl = 'https://sweet-hamster-f11198.netlify.app';
  
  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /user/
Disallow: /api/
Disallow: /auth/

# Allow important pages
Allow: /products
Allow: /category/
Allow: /search

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    },
    body: robotsTxt
  };
};
