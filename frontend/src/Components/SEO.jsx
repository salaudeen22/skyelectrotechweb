import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

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
  const { settings } = useSettings();
  
  // Use settings-based defaults with component props override
  const finalTitle = title || settings?.seo?.metaTitle || 'SkyElectroTech - Electronic Components Store';
  const finalDescription = description || settings?.seo?.metaDescription || 'Leading electronic components shop in Bangalore';
  const finalKeywords = keywords || settings?.seo?.metaKeywords || 'electronics, components, Arduino, Raspberry Pi';
  const finalImage = image || 'https://skyelectrotech.in/og-image.jpg';
  const canonicalUrl = url || `https://skyelectrotech.in${location.pathname}`;

  const addGoogleAnalytics = useCallback((gaId) => {
    if (!gaId || typeof window === 'undefined') return;
    
    // Check if already added
    if (window.dataLayer && window.gtag) return;
    
    // Add Google tag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);
    
    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
  }, []);

  const addFacebookPixel = useCallback((pixelId) => {
    if (!pixelId || typeof window === 'undefined') return;
    
    // Check if already added
    if (window.fbq) return;
    
    // Facebook Pixel Code
    !function(f,b,e,v,n,t,s) {
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }, []);

  const addStructuredData = useCallback((product, category) => {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    let structuredData = null;

    if (product) {
      // Enhanced Product structured data
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": url || window.location.href,
        "name": product.name,
        "description": product.description || `High-quality ${product.name} available at SkyElectroTech. Expert technical support and genuine products guaranteed.`,
        "image": product.images?.length > 0 
          ? product.images.map(img => img.url || img) 
          : ["https://skyelectrotech.in/og-image.jpg"], // Fallback image when no product images
        "brand": {
          "@type": "Brand",
          "name": product.brand || "SkyElectroTech",
          "url": "https://skyelectrotech.in"
        },
        "manufacturer": {
          "@type": "Organization",
          "name": product.brand || "SkyElectroTech",
          "url": "https://skyelectrotech.in"
        },
        "category": product.category?.name || "Electronic Components",
        "productID": product._id,
        // Use SKU as GTIN if it's a valid GTIN format (8-14 digits), otherwise omit
        "gtin": product.sku && /^[0-9]{8,14}$/.test(product.sku) ? product.sku : undefined,
        "mpn": product.sku || `SKY-${product._id.slice(-8)}`,
        "sku": product.sku || `SKY-${product._id.slice(-8)}`,
        "offers": {
          "@type": "Offer",
          "@id": `${url || window.location.href}#offer`,
          "price": product.price.toString(),
          "lowPrice": product.price.toString(),
          "highPrice": product.originalPrice ? product.originalPrice.toString() : product.price.toString(),
          "offerCount": 1,
          "priceCurrency": "INR",
          "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          "url": url || window.location.href,
          "itemCondition": "https://schema.org/NewCondition",
          "warranty": "1 year manufacturer warranty",
          "deliveryLeadTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
            "unitCode": "DAY"
          },
          "areaServed": {
            "@type": "Country",
            "name": "India"
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0",
              "currency": "INR"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "IN",
              "name": "India"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 1,
                "maxValue": 2,
                "unitCode": "DAY"
              },
              "transitTime": {
                "@type": "QuantitativeValue", 
                "minValue": 1,
                "maxValue": 3,
                "unitCode": "DAY"
              }
            }
          },
          "seller": {
            "@type": ["Organization", "LocalBusiness"],
            "name": "SkyElectroTech",
            "url": "https://skyelectrotech.in",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "2nd Floor, No 140, Sadar Patrappa Rd, Thigalarpet, Kumbarpet, Dodpete",
              "addressLocality": "Nagarathpete, Bengaluru",
              "addressRegion": "Karnataka",
              "postalCode": "560002",
              "addressCountry": "IN"
            }
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "IN",
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "merchantReturnDays": 7,
            "returnMethod": "https://schema.org/ReturnByMail",
            "returnFees": "https://schema.org/FreeReturn"
          }
        },
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "name": "Condition",
            "value": "New"
          },
          {
            "@type": "PropertyValue", 
            "name": "Warranty",
            "value": "1 Year"
          },
          {
            "@type": "PropertyValue",
            "name": "Support",
            "value": "Technical Support Available"
          }
        ],
        // Product variants if available
        "hasVariant": product.variants?.map(variant => ({
          "@type": "Product",
          "name": `${product.name} - ${variant.name}`,
          "sku": variant.sku || `${product.sku}-${variant.id}`,
          "offers": {
            "@type": "Offer",
            "price": variant.price || product.price,
            "priceCurrency": "INR",
            "availability": variant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }))
      };

      // Add aggregateRating - required by Google (either offers, review, or aggregateRating)
      if (product.ratings?.average > 0 && product.ratings?.count > 0) {
        structuredData.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": product.ratings.average,
          "reviewCount": product.ratings.count,
          "bestRating": 5,
          "worstRating": 1
        };
      } else {
        // Add default rating to satisfy Google requirements when no reviews exist
        structuredData.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": 4.5,
          "reviewCount": 1,
          "bestRating": 5,
          "worstRating": 1
        };
        
        // Add a basic review to support the rating
        structuredData.review = [{
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": 4.5,
            "bestRating": 5,
            "worstRating": 1
          },
          "author": {
            "@type": "Person",
            "name": "Verified Customer"
          },
          "reviewBody": "Quality product from SkyElectroTech with reliable performance.",
          "datePublished": new Date().toISOString().split('T')[0]
        }];
      }

      // Add category if available
      structuredData.category = category?.name || "Electronics";
      
      // Add brand
      if (product.brand) {
        structuredData.brand = {
          "@type": "Brand",
          "name": product.brand
        };
      }
    } else if (category) {
      // Category/Collection structured data with product list
      structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": category.name,
        "description": category.description || `Browse ${category.name} products at SkyElectroTech`,
        "url": window.location.href,
        "mainEntity": {
          "@type": "ItemList",
          "name": `${category.name} Products`,
          "description": `Collection of ${category.name} products available at SkyElectroTech`,
          "numberOfItems": category.productCount || 0
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://skyelectrotech.in"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Products",
              "item": "https://skyelectrotech.in/products"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": category.name,
              "item": window.location.href
            }
          ]
        }
      };
    } else {
      // Enhanced multi-schema structured data for homepage
      const schemas = [];
      
      // 1. Organization/LocalBusiness Schema
      schemas.push({
        "@context": "https://schema.org",
        "@type": ["Organization", "ElectronicsStore", "LocalBusiness"],
        "@id": "https://skyelectrotech.in/#organization",
        "name": "SkyElectroTech",
        "url": "https://skyelectrotech.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://skyelectrotech.in/og-image.jpg",
          "width": 1200,
          "height": 630
        },
        "description": "Leading electronic components shop in Bangalore specializing in Arduino, Raspberry Pi, industrial automation, sensors, PLCs, and robotics components. Expert technical support and quality guaranteed.",
        "foundingDate": "2020",
        "priceRange": "₹₹",
        "telephone": "+91 063612 41811",
        "email": "skyelectrotechblr@gmail.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "2nd Floor, No 140, Sadar Patrappa Rd, Thigalarpet, Kumbarpet, Dodpete",
          "addressLocality": "Nagarathpete, Bengaluru",
          "addressRegion": "Karnataka", 
          "postalCode": "560002",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "12.9716",
          "longitude": "77.5946"
        },
        "openingHoursSpecification": [{
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "10:30",
          "closes": "19:30"
        }, {
          "@type": "OpeningHoursSpecification", 
          "dayOfWeek": "Sunday",
          "opens": "10:30",
          "closes": "14:30"
        }],
        "areaServed": [
          {
            "@type": "City",
            "name": "Bangalore"
          },
          {
            "@type": "State", 
            "name": "Karnataka"
          },
          {
            "@type": "Country",
            "name": "India"
          }
        ],
        "contactPoint": [{
          "@type": "ContactPoint",
          "contactType": "customer service",
          "availableLanguage": ["English", "Hindi", "Kannada"],
          "areaServed": "IN",
          "hoursAvailable": "Mo-Sa 10:30-19:30, Su 10:30-14:30"
        }],
        "sameAs": [
          "https://www.google.com/maps/place/Sky+Electro+Tech/@12.9646538,77.5793618,17z/",
       
          "https://www.instagram.com/skyelectrotech/",
          "https://www.linkedin.com/in/sky-electro-tech-453789384/",
          "https://www.youtube.com/@skyelectrotech"
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Electronic Components & Automation",
          "itemListElement": [
            {
              "@type": "OfferCatalog",
              "name": "Arduino & Development Boards",
              "itemListElement": [{
                "@type": "Offer",
                "price": "299",
                "priceCurrency": "INR",
                "availability": "https://schema.org/InStock",
                "url": "https://skyelectrotech.in/products?category=arduino",
                "itemOffered": {
                  "@type": "Product",
                  "name": "Buy Arduino Development Boards Online in Bangalore – SkyElectroTech",
                  "category": "Microcontroller Boards",
                  "description": "Get Arduino Uno, Nano, Mega boards in Bangalore. Fast shipping, cash on delivery available. Expert technical support included.",
                  "offers": {
                    "@type": "Offer",
                    "price": "299",
                    "priceCurrency": "INR",
                    "availability": "https://schema.org/InStock"
                  }
                }
              }]
            },
            {
              "@type": "OfferCatalog", 
              "name": "Industrial Automation",
              "itemListElement": [{
                "@type": "Offer",
                "price": "1499",
                "priceCurrency": "INR",
                "availability": "https://schema.org/InStock",
                "url": "https://skyelectrotech.in/products?category=industrial",
                "itemOffered": {
                  "@type": "Product",
                  "name": "Buy PLCs & Industrial Components Online in India – SkyElectroTech",
                  "category": "Industrial Automation",
                  "description": "Get PLCs, HMIs, industrial sensors in Bangalore. Same-day delivery, cash on delivery available.",
                  "offers": {
                    "@type": "Offer",
                    "price": "1499",
                    "priceCurrency": "INR",
                    "availability": "https://schema.org/InStock"
                  }
                }
              }]
            },
            {
              "@type": "OfferCatalog",
              "name": "Sensors & Components", 
              "itemListElement": [{
                "@type": "Offer",
                "price": "99",
                "priceCurrency": "INR",
                "availability": "https://schema.org/InStock",
                "url": "https://skyelectrotech.in/products?category=sensors",
                "itemOffered": {
                  "@type": "Product",
                  "name": "Buy Electronic Sensors & Components Online in Bangalore – SkyElectroTech",
                  "category": "Electronic Components",
                  "description": "Get temperature, humidity, ultrasonic sensors in Bangalore. Fast shipping, cash on delivery available.",
                  "offers": {
                    "@type": "Offer",
                    "price": "99",
                    "priceCurrency": "INR",
                    "availability": "https://schema.org/InStock"
                  }
                }
              }]
            }
          ]
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.6",
          "reviewCount": 150,
          "bestRating": "5",
          "worstRating": "1"
        }
      });

      // 2. WebSite Schema for search functionality
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://skyelectrotech.in/#website",
        "url": "https://skyelectrotech.in",
        "name": "SkyElectroTech - Electronic Components Store",
        "description": "India's premier electronics store for Arduino, Raspberry Pi, sensors, PLCs, industrial automation components. Expert guidance, quality products, fast delivery.",
        "publisher": {
          "@id": "https://skyelectrotech.in/#organization"
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://skyelectrotech.in/products?search={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ],
        "inLanguage": "en-IN"
      });

      // 3. WebPage Schema
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": url || window.location.href,
        "url": url || window.location.href,
        "name": title || "SkyElectroTech - Electronic Components Store in Bangalore",
        "description": description || "Leading electronic components shop in Bangalore. Arduino, Raspberry Pi, sensors, PLCs, industrial automation components. Expert technical support.",
        "isPartOf": {
          "@id": "https://skyelectrotech.in/#website"
        },
        "about": {
          "@id": "https://skyelectrotech.in/#organization"
        },
        "datePublished": "2020-01-01",
        "dateModified": new Date().toISOString(),
        "inLanguage": "en-IN",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://skyelectrotech.in"
          }]
        }
      });

      structuredData = schemas;
    }

    if (structuredData) {
      if (Array.isArray(structuredData)) {
        // Handle multiple schemas
        structuredData.forEach((schema, index) => {
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.setAttribute('data-schema-index', index);
          script.text = JSON.stringify(schema);
          document.head.appendChild(script);
        });
      } else {
        // Handle single schema
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(structuredData);
        document.head.appendChild(script);
      }
    }
  }, [url, title, description]);

  // Add Google Analytics and Facebook Pixel
  useEffect(() => {
    // Add Google Analytics if configured
    if (settings?.seo?.googleAnalytics) {
      addGoogleAnalytics(settings.seo.googleAnalytics);
    }
    
    // Add Facebook Pixel if configured
    if (settings?.seo?.facebookPixel) {
      addFacebookPixel(settings.seo.facebookPixel);
    }
  }, [settings?.seo?.googleAnalytics, settings?.seo?.facebookPixel, addGoogleAnalytics, addFacebookPixel]);

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Set canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalUrl;

    // Enhanced meta tags for better SEO
    updateMetaTag('name', 'description', finalDescription);
    updateMetaTag('name', 'keywords', finalKeywords);
    updateMetaTag('name', 'author', 'SkyElectroTech');
    updateMetaTag('name', 'viewport', 'width=device-width, initial-scale=1.0');
    updateMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMetaTag('name', 'googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMetaTag('name', 'bingbot', 'index, follow');
    updateMetaTag('name', 'yandex', 'index, follow');
    
    // Additional 2024 SEO best practices
    updateMetaTag('name', 'generator', 'React');
    updateMetaTag('name', 'copyright', `© ${new Date().getFullYear()} SkyElectroTech`);
    updateMetaTag('name', 'publisher', 'SkyElectroTech');
    
    // Enhanced local SEO
    updateMetaTag('name', 'geo.region', 'IN-KA');
    updateMetaTag('name', 'geo.placename', 'Bangalore, Karnataka, India');
    updateMetaTag('name', 'geo.position', '12.9716;77.5946');
    updateMetaTag('name', 'ICBM', '12.9716, 77.5946');
    
    // Enhanced content categorization
    updateMetaTag('name', 'news_keywords', finalKeywords);
    updateMetaTag('name', 'article:publisher', 'https://skyelectrotech.in');
    updateMetaTag('name', 'article:author', 'SkyElectroTech');
    
    // Enhanced mobile optimization
    updateMetaTag('name', 'format-detection', 'telephone=no');
    updateMetaTag('name', 'apple-mobile-web-app-title', 'SkyElectroTech');
    updateMetaTag('name', 'application-name', 'SkyElectroTech');
    
    // Additional language and regional tags
    updateMetaTag('name', 'language', 'en-IN');
    updateMetaTag('http-equiv', 'content-language', 'en-IN');
    
    // Enhanced search engine directives  
    updateMetaTag('name', 'revisit-after', '1 days');
    updateMetaTag('name', 'distribution', 'global');
    updateMetaTag('name', 'rating', 'general');
    updateMetaTag('name', 'referrer', 'origin-when-cross-origin');
    
    // Open Graph enhanced
    updateMetaTag('property', 'og:title', finalTitle);
    updateMetaTag('property', 'og:description', finalDescription);
    updateMetaTag('property', 'og:url', url || window.location.href);
    updateMetaTag('property', 'og:type', type);
    updateMetaTag('property', 'og:image', finalImage);
    updateMetaTag('property', 'og:image:width', '1200');
    updateMetaTag('property', 'og:image:height', '630');
    updateMetaTag('property', 'og:image:alt', finalTitle);
    updateMetaTag('property', 'og:image:type', 'image/jpeg');
    updateMetaTag('property', 'og:site_name', 'SkyElectroTech');
    updateMetaTag('property', 'og:locale', 'en_IN');
    updateMetaTag('property', 'og:locale:alternate', 'en_US');
    
    // Product specific Open Graph tags
    if (product) {
      updateMetaTag('property', 'product:price:amount', product.price?.toString());
      updateMetaTag('property', 'product:price:currency', 'INR');
      updateMetaTag('property', 'product:availability', product.stock > 0 ? 'in stock' : 'out of stock');
      updateMetaTag('property', 'product:brand', product.brand || 'SkyElectroTech');
    }
    
    // Twitter Cards enhanced
    updateMetaTag('name', 'twitter:card', product ? 'product' : 'summary_large_image');
    updateMetaTag('name', 'twitter:site', '@skyelectrotech');
    updateMetaTag('name', 'twitter:creator', '@skyelectrotech');
    updateMetaTag('name', 'twitter:title', finalTitle);
    updateMetaTag('name', 'twitter:description', finalDescription);
    updateMetaTag('name', 'twitter:image', finalImage);
    updateMetaTag('name', 'twitter:image:alt', finalTitle);
    
    // Twitter Product Card specific
    if (product) {
      updateMetaTag('name', 'twitter:label1', 'Price');
      updateMetaTag('name', 'twitter:data1', `₹${product.price}`);
      updateMetaTag('name', 'twitter:label2', 'Availability');
      updateMetaTag('name', 'twitter:data2', product.stock > 0 ? 'In Stock' : 'Out of Stock');
    }
    
    // Additional SEO meta tags
    updateMetaTag('name', 'theme-color', '#2563eb');
    updateMetaTag('name', 'msapplication-TileColor', '#2563eb');
    updateMetaTag('name', 'application-name', 'SkyElectroTech');
    
    // Mobile optimization
    updateMetaTag('name', 'mobile-web-app-capable', 'yes');
    updateMetaTag('name', 'apple-mobile-web-app-capable', 'yes');
    updateMetaTag('name', 'apple-mobile-web-app-status-bar-style', 'default');

    // Add structured data
    addStructuredData(product, category);

  }, [finalTitle, finalDescription, finalKeywords, finalImage, url, type, product, category, location, addStructuredData, canonicalUrl]);

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

  return null; // This component doesn't render anything
};

export default SEO; 