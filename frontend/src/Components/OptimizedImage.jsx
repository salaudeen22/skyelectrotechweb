import { useState, useEffect, useRef } from 'react';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg==',
  sizes = '100vw',
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Generate WebP src if supported
  const generateWebPSrc = (originalSrc) => {
    if (!originalSrc) return originalSrc;
    
    // If it's already a WebP image, return as is
    if (originalSrc.includes('.webp')) return originalSrc;
    
    // For external images, we can't convert to WebP
    if (originalSrc.startsWith('http') && !originalSrc.includes('skyelectrotech.in')) {
      return originalSrc;
    }
    
    // For local images, we can serve WebP versions
    // This assumes you have WebP versions of your images
    const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return webpSrc;
  };

  // Generate responsive srcset
  const generateSrcSet = (originalSrc) => {
    if (!originalSrc) return '';
    
    // For external images, return empty srcset
    if (originalSrc.startsWith('http') && !originalSrc.includes('skyelectrotech.in')) {
      return '';
    }
    
    // Generate different sizes for local images
    const sizes = [320, 640, 768, 1024, 1280];
    const srcSet = sizes.map(size => `${originalSrc}?w=${size} ${size}w`).join(', ');
    return srcSet;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const webpSrc = generateWebPSrc(src);
  const srcSet = generateSrcSet(src);
  const webpSrcSet = generateSrcSet(webpSrc);

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto'
      }}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(10px)' }}
        />
      )}

      {/* WebP Image */}
      {isInView && webpSrc !== src && (
        <picture>
          <source
            type="image/webp"
            srcSet={webpSrcSet}
            sizes={sizes}
          />
          <img
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            {...props}
          />
        </picture>
      )}

      {/* Fallback Image */}
      {isInView && webpSrc === src && (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          {...props}
        />
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Image not available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage; 