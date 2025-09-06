import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../hooks/useAuth';
import { 
    FaTachometerAlt, 
    FaBoxOpen, 
    FaChartBar, 
    FaUsers, 
    FaSignOutAlt,
    FaBolt, // A great icon for electronics
    FaUserCircle,
    FaTags, // Icon for categories
    FaComments, // Icon for comments
    FaTimes,
    FaBars,
    FaCog,
    FaClipboardList, // Icon for order management
    FaUndo, // Icon for return requests
    FaTools, // Icon for services
    FaChevronDown,
    FaChevronRight,
    FaStore, // Icon for store management
    FaShoppingCart, // Icon for commerce
    FaTicketAlt // Icon for coupons
} from 'react-icons/fa';
// import { toast } from 'react-hot-toast';

const AdminSidebar = ({ isOpen, onToggle }) => {
    const { settings } = useSettings();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const location = useLocation();
    
    // State for collapsible sections
    const [collapsedSections, setCollapsedSections] = useState(() => {
        // Auto-expand sections based on current route
        const currentPath = window.location.pathname;
        return {
            catalog: !(['/admin/products', '/admin/categories'].some(route => currentPath.startsWith(route))),
            sales: !(['/admin/orders', '/admin/return-requests', '/admin/coupons'].some(route => currentPath.startsWith(route))),
            customers: !(['/admin/employees', '/admin/comments', '/admin/services'].some(route => currentPath.startsWith(route))),
            system: false
        };
    });
    
    // Toggle collapsed state for a section
    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Check if any route in a group is active
    const isGroupActive = (routes) => {
        return routes.some(route => location.pathname.startsWith(route));
    };
    
    // --- Style Definitions for NavLinks ---
    const commonLinkStyles = "flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-lg transition-all duration-200 group";
    
    // Style for the currently active link
    const activeLinkStyle = "bg-blue-600 text-white shadow-lg";

    // Style for inactive links
    const inactiveLinkStyle = "text-gray-600 hover:bg-blue-50 hover:text-blue-600";

    // Style for group headers
    const groupHeaderStyle = "flex items-center justify-between w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-lg transition-all duration-200 cursor-pointer hover:bg-gray-50";

    // Style for sub-items
    const subItemStyle = "flex items-center w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group";

    // Handle mobile menu close when clicking on a link
    const handleLinkClick = () => {
        if (window.innerWidth < 1024) { // lg breakpoint
            onToggle();
        }
    };

    const handleLogout = () => {
        logout();
        // Remove duplicate toast: global logout already shows a toast
        navigate('/admin/login');
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}
            
            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-xl flex flex-col z-50 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 lg:sticky lg:top-0 lg:left-0 lg:z-40 lg:h-screen lg:shadow-none
                overflow-y-auto lg:overflow-y-hidden
            `}>
                
                {/* Mobile close button */}
                <div className="lg:hidden absolute top-4 right-4 z-10">
                    <button
                        onClick={onToggle}
                        className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                        <FaTimes className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>
            {/* Logo / Brand Header */}
            <div className="flex items-center justify-center px-4 h-24 sm:h-32 border-b border-gray-200">
                <Link to="/" className="flex items-center justify-center">
                    <img 
                        src="/favicon_io (1)/android-chrome-512x512.png" 
                        alt={settings.storeInfo.name || "SkyElectroTech"} 
                        className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 object-contain"
                        onError={(e) => {
                            // Fallback to a text logo if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                    <div 
                        className="hidden items-center justify-center h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 bg-blue-600 rounded-lg text-white font-bold text-sm sm:text-base lg:text-lg"
                        style={{ display: 'none' }}
                    >
                        SET
                    </div>
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
                {/* Dashboard - Always visible */}
                <NavLink 
                    to="/admin" 
                    end 
                    onClick={handleLinkClick}
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaTachometerAlt className="mr-3 sm:mr-4 h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Dashboard</span>
                </NavLink>

                {/* Catalog Management Group */}
                <div className="space-y-1">
                    <button
                        onClick={() => toggleSection('catalog')}
                        className={`${groupHeaderStyle} ${isGroupActive(['/admin/products', '/admin/categories']) ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                    >
                        <div className="flex items-center">
                            <FaStore className="mr-3 sm:mr-4 h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Catalog</span>
                        </div>
                        {collapsedSections.catalog ? 
                            <FaChevronRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" /> : 
                            <FaChevronDown className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" />
                        }
                    </button>
                    {!collapsedSections.catalog && (
                        <div className="space-y-1 transition-all duration-200 ease-in-out">
                            <NavLink 
                                to="/admin/products" 
                                onClick={handleLinkClick}
                                className={({isActive}) => `${subItemStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                            > 
                                <FaBoxOpen className="mr-3 sm:mr-4 h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Products</span>
                            </NavLink>
                            <NavLink 
                                to="/admin/categories" 
                                onClick={handleLinkClick}
                                className={({isActive}) => `${subItemStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                            > 
                                <FaTags className="mr-3 sm:mr-4 h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Categories</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Sales & Orders Group */}
                <div className="space-y-1">
                    <button
                        onClick={() => toggleSection('sales')}
                        className={`${groupHeaderStyle} ${isGroupActive(['/admin/orders', '/admin/return-requests', '/admin/coupons']) ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                    >
                        <div className="flex items-center">
                            <FaShoppingCart className="mr-3 sm:mr-4 h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Sales</span>
                        </div>
                        {collapsedSections.sales ? 
                            <FaChevronRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" /> : 
                            <FaChevronDown className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" />
                        }
                    </button>
                    {!collapsedSections.sales && (
                        <div className="space-y-1 transition-all duration-200 ease-in-out">
                            <NavLink 
                                to="/admin/orders" 
                                onClick={handleLinkClick}
                                className={({isActive}) => `${subItemStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                            > 
                                <FaClipboardList className="mr-3 sm:mr-4 h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Orders & Sales</span>
                            </NavLink>
                            <NavLink 
                                to="/admin/return-requests" 
                                onClick={handleLinkClick}
                                className={({isActive}) => `${subItemStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                            > 
                                <FaUndo className="mr-3 sm:mr-4 h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Return Requests</span>
                            </NavLink>
                            <NavLink 
                                to="/admin/coupons" 
                                onClick={handleLinkClick}
                                className={({isActive}) => `${subItemStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                            > 
                                <FaTicketAlt className="mr-3 sm:mr-4 h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Coupons</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Customer Management Group */}
                <div className="space-y-1">
                    <button
                        onClick={() => toggleSection('customers')}
                        className={`${groupHeaderStyle} ${isGroupActive(['/admin/employees', '/admin/comments', '/admin/services']) ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                    >
                        <div className="flex items-center">
                            <FaUsers className="mr-3 sm:mr-4 h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Customer Care</span>
                        </div>
                        {collapsedSections.customers ? 
                            <FaChevronRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" /> : 
                            <FaChevronDown className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" />
                        }
                    </button>
                    {!collapsedSections.customers && (
                        <div className="space-y-1 transition-all duration-200 ease-in-out">
                            <NavLink 
                                to="/admin/employees" 
                                onClick={handleLinkClick}
                                className={({isActive}) => `${subItemStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                            > 
                                <FaUsers className="mr-3 sm:mr-4 h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Employees</span>
                            </NavLink>
                            <NavLink 
                                to="/admin/comments" 
                                onClick={handleLinkClick}
                                className={({isActive}) => `${subItemStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                            > 
                                <FaComments className="mr-3 sm:mr-4 h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Comments</span>
                            </NavLink>
                            <NavLink 
                                to="/admin/services" 
                                onClick={handleLinkClick}
                                className={({isActive}) => `${subItemStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                            > 
                                <FaTools className="mr-3 sm:mr-4 h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Service Requests</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* System Settings - Always visible */}
                <NavLink 
                    to="/admin/settings" 
                    onClick={handleLinkClick}
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaCog className="mr-3 sm:mr-4 h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Settings</span>
                </NavLink>
            </nav>

            {/* Footer / User & Logout Section */}
            <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-200 mt-auto">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                    {user?.avatar?.url ? (
                        <img
                            src={user.avatar.url}
                            alt={user.name}
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                                // Fallback to default icon if image fails to load
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                    ) : null}
                    <FaUserCircle 
                        className={`h-8 w-8 sm:h-10 sm:w-10 text-gray-400 ${user?.avatar?.url ? 'hidden' : ''}`}
                        style={{ display: user?.avatar?.url ? 'none' : 'block' }}
                    />
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                            {user?.name || 'Admin User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user?.email || 'admin@skyelectro.tech'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-lg text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200 group"
                >
                    <FaSignOutAlt className="mr-3 sm:mr-4 h-4 w-4 sm:h-5 sm:w-5"/>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
        </>
    );
};

export default AdminSidebar;