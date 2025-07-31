import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { useSettings } from '../contexts/SettingsContext';

const AnalyticsTracker = () => {
  const location = useLocation();
  const { trackPage } = useAnalytics();
  const { settings } = useSettings();

  useEffect(() => {
    // Track page view when location changes
    const pageTitle = document.title || settings.storeInfo.name;
    const pagePath = location.pathname + location.search;
    
    trackPage(pageTitle, pagePath);
  }, [location, trackPage]);

  return null; // This component doesn't render anything
};

export default AnalyticsTracker; 