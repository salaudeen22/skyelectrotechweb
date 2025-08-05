const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// Generate sitemap XML
const generateSitemap = async () => {
  const baseUrl = process.env.CLIENT_URL || 'https://skyelectrotech.in';
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
    { url: '/terms-of-service', priority: '0.3', changefreq: 'yearly' }
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

  // Add categories
  try {
    const categories = await Category.find({ isActive: true }).select('_id name updatedAt');
    categories.forEach(category => {
      sitemap += `
  <url>
    <loc>${baseUrl}/category/${category._id}</loc>
    <lastmod>${category.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  // Add products (limit to 1000 for performance)
  try {
    const products = await Product.find({ isActive: true })
      .select('_id name updatedAt')
      .sort({ updatedAt: -1 })
      .limit(1000);

    products.forEach(product => {
      sitemap += `
  <url>
    <loc>${baseUrl}/products/${product._id}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  sitemap += `
</urlset>`;

  return sitemap;
};

// GET /api/sitemap.xml
router.get('/sitemap.xml', asyncHandler(async (req, res) => {
  try {
    const sitemap = await generateSitemap();
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    sendError(res, 500, 'Error generating sitemap');
  }
}));

// GET /api/robots.txt
router.get('/robots.txt', asyncHandler(async (req, res) => {
  const baseUrl = process.env.CLIENT_URL || 'https://skyelectrotech.in';
  
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
Sitemap: ${baseUrl}/api/sitemap.xml

# Crawl-delay
Crawl-delay: 1`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.send(robotsTxt);
}));

module.exports = router; 