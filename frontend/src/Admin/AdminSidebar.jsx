import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
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
    FaUndo // Icon for return requests
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const AdminSidebar = ({ isOpen, onToggle }) => {
    const { settings } = useSettings();
    const navigate = useNavigate();
    const { logout } = useAuth();
    
    // --- Style Definitions for NavLinks ---
    const commonLinkStyles = "flex items-center w-full px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 group";
    
    // Style for the currently active link
    const activeLinkStyle = "bg-blue-600 text-white shadow-lg";

    // Style for inactive links
    const inactiveLinkStyle = "text-gray-600 hover:bg-blue-50 hover:text-blue-600";

    // Handle mobile menu close when clicking on a link
    const handleLinkClick = () => {
        if (window.innerWidth < 1024) { // lg breakpoint
            onToggle();
        }
    };

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully!");
        navigate('/admin/login');
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}
            
            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-xl flex flex-col z-50 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 lg:relative lg:z-40 lg:h-auto lg:min-h-screen
            `}>
                
                {/* Mobile close button */}
                <div className="lg:hidden absolute top-4 right-4 z-10">
                    <button
                        onClick={onToggle}
                        className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                        <FaTimes className="h-5 w-5" />
                    </button>
                </div>
            {/* Logo / Brand Header */}
            <div className="flex items-center justify-center px-4 h-32 border-b border-gray-200">
                <Link to="/" className="flex items-center justify-center">
                    <img 
                        src="/favicon_io (1)/android-chrome-512x512.png" 
                        alt={settings.storeInfo.name || "SkyElectroTech"} 
                        className="h-24 w-24 object-contain"
                        onError={(e) => {
                            // Fallback to a text logo if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                    <div 
                        className="hidden items-center justify-center h-24 w-24 bg-blue-600 rounded-lg text-white font-bold text-lg"
                        style={{ display: 'none' }}
                    >
                        SET
                    </div>
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink 
                    to="/admin" 
                    end 
                    onClick={handleLinkClick}
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaTachometerAlt className="mr-4 h-5 w-5" />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink 
                    to="/admin/products" 
                    onClick={handleLinkClick}
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaBoxOpen className="mr-4 h-5 w-5" />
                    <span>Products</span>
                </NavLink>
                <NavLink 
                    to="/admin/categories" 
                    onClick={handleLinkClick}
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaTags className="mr-4 h-5 w-5" />
                    <span>Categories</span>
                </NavLink>
                <NavLink 
                    to="/admin/comments" 
                    onClick={handleLinkClick}
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaComments className="mr-4 h-5 w-5" />
                    <span>Comments</span>
                </NavLink>
                <NavLink 
                    to="/admin/orders" 
                    onClick={handleLinkClick}
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaClipboardList className="mr-4 h-5 w-5" />
                    <span>Orders & Sales</span>
                </NavLink>
                <NavLink 
                    to="/admin/return-requests" 
                    onClick={handleLinkClick}
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaUndo className="mr-4 h-5 w-5" />
                    <span>Return Requests</span>
                </NavLink>
                <NavLink 
                    to="/admin/employees" 
                    onClick={handleLinkClick}
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaUsers className="mr-4 h-5 w-5" />
                    <span>Employees</span>
                </NavLink>
                <NavLink 
                    to="/admin/settings" 
                    onClick={handleLinkClick}
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaCog className="mr-4 h-5 w-5" />
                    <span>Settings</span>
                </NavLink>
            </nav>

            {/* Footer / User & Logout Section */}
            <div className="px-4 py-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                    <FaUserCircle className="h-10 w-10 text-gray-400"/>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Admin User</p>
                        <p className="text-xs text-gray-500">admin@skyelectro.tech</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-base font-medium rounded-lg text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200 group"
                >
                    <FaSignOutAlt className="mr-4 h-5 w-5"/>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
        </>
    );
};

export default AdminSidebar;