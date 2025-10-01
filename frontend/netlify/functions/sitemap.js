const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    const baseUrl = 'https://sweet-hamster-f11198.netlify.app';
    const apiUrl = 'https://skyelectrotechweb.onrender.com/api';
    const currentDate = new Date().toISOString();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/products', priority: '0.9', changefreq: 'daily' },
      { url: '/auth/login', priority: '0.5', changefreq: 'monthly' },
      { url: '/auth/register', priority: '0.5', changefreq: 'monthly' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
      { url: '/faq', priority: '0.6', changefreq: 'monthly' }
    ];

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Try to fetch categories from API
    try {
      const categoriesResponse = await axios.get(`${apiUrl}/categories?limit=100`);
      if (categoriesResponse.data && categoriesResponse.data.categories) {
        categoriesResponse.data.categories.forEach(category => {
          sitemap += `
  <url>
    <loc>${baseUrl}/category/${category._id}</loc>
    <lastmod>${category.updatedAt || currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });
      }
    } catch (error) {
    }

    // Try to fetch products from API (limit to 500 for performance)
    try {
      const productsResponse = await axios.get(`${apiUrl}/products?limit=500&sort=-updatedAt`);
      if (productsResponse.data && productsResponse.data.products) {
        productsResponse.data.products.forEach(product => {
          sitemap += `
  <url>
    <loc>${baseUrl}/products/${product._id}</loc>
    <lastmod>${product.updatedAt || currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });
      }
    } catch (error) {
    }

    sitemap += `
</urlset>`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      },
      body: sitemap
    };

  } catch (error) {
    
    // Return a basic sitemap with static pages only if API fails
    const baseUrl = 'https://sweet-hamster-f11198.netlify.app';
    const currentDate = new Date().toISOString();
    
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      },
      body: fallbackSitemap
    };
  }
};
