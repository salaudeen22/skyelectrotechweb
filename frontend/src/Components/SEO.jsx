import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  product = null,
  category = null 
}) => {
  const location = useLocation();

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update meta tags
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', url || window.location.href);
    updateMetaTag('property', 'og:type', type);
    updateMetaTag('property', 'og:image', image);
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', image);
    updateMetaTag('property', 'og:site_name', 'SkyElectroTech');

    // Update canonical URL
    updateCanonical(url || window.location.href);

    // Add structured data
    addStructuredData(product, category);

  }, [title, description, keywords, image, url, type, product, category, location]);

  const updateMetaTag = (attr, value, content) => {
    if (!content) return;

    let meta = document.querySelector(`meta[${attr}="${value}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attr, value);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  const updateCanonical = (url) => {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  };

  const addStructuredData = (product, category) => {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    let structuredData = null;

    if (product) {
      // Product structured data
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.images?.[0]?.url || '',
        "brand": {
          "@type": "Brand",
          "name": product.brand || "SkyElectroTech"
        },
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "INR",
          "availability": product.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "SkyElectroTech"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.ratings?.average || 0,
          "reviewCount": product.ratings?.count || 0
        },
        "category": category?.name || "Electronics"
      };
    } else if (category) {
      // Category structured data
      structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": category.name,
        "description": category.description || `Browse ${category.name} products at SkyElectroTech`,
        "url": window.location.href
      };
    } else {
      // Organization structured data
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "SkyElectroTech",
        "url": "https://skyelectrotech.in",
        "logo": "https://skyelectrotech.in/logo-large.svg",
        "description": "Premium electronics and components store",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "availableLanguage": "English"
        },
        "sameAs": [
          "https://facebook.com/skyelectrotech",
          "https://twitter.com/skyelectrotech",
          "https://instagram.com/skyelectrotech"
        ]
      };
    }

    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  };

  return null; // This component doesn't render anything
};

export default SEO; 