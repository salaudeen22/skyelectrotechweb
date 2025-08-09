export const SITE_URL = import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

export const buildProductUrl = (productId) => {
  const base = SITE_URL?.replace(/\/$/, '') || '';
  return `${base}/products/${productId}`;
};


