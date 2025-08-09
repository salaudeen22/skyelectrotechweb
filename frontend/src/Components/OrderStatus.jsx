import React from 'react';

const OrderStatus = ({ status, size = 'default' }) => {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        packed: 'bg-indigo-100 text-indigo-800',
        shipped: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        returned: 'bg-orange-100 text-orange-800',
        refunded: 'bg-teal-100 text-teal-800'
    };
    
    const sizeClasses = {
        small: 'px-2 py-1 text-xs',
        default: 'px-3 py-1 text-xs',
        large: 'px-4 py-2 text-sm'
    };
    
    const displayStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    const sizeClass = sizeClasses[size] || sizeClasses.default;
    
    return (
        <span className={`${sizeClass} font-semibold rounded-full ${styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
            {displayStatus}
        </span>
    );
};

export default OrderStatus; 