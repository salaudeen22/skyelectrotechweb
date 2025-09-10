import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';
import { useEffect, useMemo } from 'react';

const Breadcrumb = ({ customItems = [] }) => {
  const location = useLocation();
  
  // Generate breadcrumb items from current path
  const generateBreadcrumbs = () => {
    if (customItems.length > 0) {
      return [{ name: 'Home', path: '/' }, ...customItems];
    }
    
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    
    let currentPath = '';
    pathnames.forEach((name, index) => {
      currentPath += `/${name}`;
      
      // Convert path segments to readable names
      let displayName = name;
      if (name === 'products') displayName = 'Electronic Components';
      else if (name === 'product') displayName = 'Product';
      else if (name === 'category') displayName = 'Category';
      else if (name === 'auth') displayName = 'Authentication';
      else if (name === 'about') displayName = 'About SkyElectroTech';
      else if (name === 'contact') displayName = 'Contact Electronics Store';
      else if (name === 'admin') displayName = 'Admin Panel';
      else if (name === 'arduino') displayName = 'Arduino Boards & Components';
      else if (name === 'raspberry-pi') displayName = 'Raspberry Pi Products';
      else if (name === 'sensors') displayName = 'Electronic Sensors';
      else if (name === 'automation') displayName = 'Industrial Automation';
      else if (name === 'plc') displayName = 'PLC & Control Systems';
      else if (name.includes('-')) {
        // Convert kebab-case to title case
        displayName = name.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
      
      breadcrumbs.push({
        name: displayName,
        path: currentPath,
        isLast: index === pathnames.length - 1
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = useMemo(() => generateBreadcrumbs(), [location.pathname, customItems]);

  // Add structured data for breadcrumbs
  useEffect(() => {
    // Remove existing breadcrumb structured data
    const existingScript = document.querySelector('script[data-breadcrumb="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new breadcrumb structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": breadcrumb.name,
        "item": `https://skyelectrotech.in${breadcrumb.path}`
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb', 'true');
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [breadcrumbs]);

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on home page
  }

  return (
    <nav aria-label="Breadcrumb" className="bg-gray-50 px-4 py-3 border-b">
      <ol className="flex items-center space-x-2 max-w-7xl mx-auto">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="flex items-center">
            {index > 0 && (
              <FiChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            )}
            
            {breadcrumb.isLast ? (
              <span className="text-gray-600 font-medium flex items-center">
                {index === 0 && <FiHome className="mr-1 h-4 w-4" />}
                {breadcrumb.name}
              </span>
            ) : (
              <Link
                to={breadcrumb.path}
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
              >
                {index === 0 && <FiHome className="mr-1 h-4 w-4" />}
                {breadcrumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;