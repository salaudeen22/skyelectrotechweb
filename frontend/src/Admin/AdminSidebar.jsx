import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
    FaTachometerAlt, 
    FaBoxOpen, 
    FaChartBar, 
    FaWarehouse, 
    FaUsers, 
    FaSignOutAlt,
    FaBolt, // A great icon for electronics
    FaUserCircle
} from 'react-icons/fa';

const AdminSidebar = () => {
    // --- Style Definitions for NavLinks ---
    const commonLinkStyles = "flex items-center w-full px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 group";
    
    // Style for the currently active link
    const activeLinkStyle = "bg-blue-600 text-white shadow-lg";

    // Style for inactive links
    const inactiveLinkStyle = "text-gray-600 hover:bg-blue-50 hover:text-blue-600";

    return (
        <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-xl flex flex-col z-40">
            
            {/* Logo / Brand Header */}
            <div className="flex items-center justify-center px-4 h-24 border-b border-gray-200">
                <Link to="/" className="flex items-center space-x-2">
                    <FaBolt className="h-8 w-8 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        Sky<span className="text-blue-600">electro</span>
                    </h1>
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink 
                    to="/admin" 
                    end 
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaTachometerAlt className="mr-4 h-5 w-5" />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink 
                    to="/admin/products" 
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaBoxOpen className="mr-4 h-5 w-5" />
                    <span>Products</span>
                </NavLink>
                <NavLink 
                    to="/admin/sales" 
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaChartBar className="mr-4 h-5 w-5" />
                    <span>Sales</span>
                </NavLink>
                <NavLink 
                    to="/admin/inventory" 
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaWarehouse className="mr-4 h-5 w-5" />
                    <span>Inventory</span>
                </NavLink>
                <NavLink 
                    to="/admin/employees" 
                    className={({isActive}) => `${commonLinkStyles} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                > 
                    <FaUsers className="mr-4 h-5 w-5" />
                    <span>Employees</span>
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
                    onClick={() => {
                        // A better practice is to have a dedicated auth context/function for this
                        // For now, this works.
                        console.log("Logging out...");
                        // localStorage.removeItem('isAdmin'); 
                        window.location.href = '/admin/login'; // Redirect to login
                    }}
                    className="flex items-center w-full px-4 py-3 text-base font-medium rounded-lg text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200 group"
                >
                    <FaSignOutAlt className="mr-4 h-5 w-5"/>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;