import React, { useState, useMemo } from 'react';
import { FaPlus, FaSearch, FaPencilAlt, FaTrashAlt, FaTimes } from 'react-icons/fa';

// --- Updated Dummy Data with Images ---
const dummyProducts = [
  { id: 1, name: 'Arduino Uno R3', category: 'Development Board', price: 550, stock: 58, imageUrl: 'https://www.theengineerstore.in/cdn/shop/products/arduino-uno-r3-1.png?v=1701086206' },
  { id: 2, name: 'Raspberry Pi 4 (2GB)', category: 'SBC', price: 4500, stock: 24, imageUrl: 'https://m.media-amazon.com/images/I/6120PfrjBqL.jpg' },
  { id: 3, name: 'ESP32-WROOM-32 Dev Board', category: 'Module', price: 750, stock: 35, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuBZkNT4gPIhsPepZy6C4e-SZ_0Y7T4St__g&s' },
  { id: 4, name: 'SG90 Micro Servo Motor', category: 'Actuator', price: 120, stock: 150, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2024/12/471505966/XG/QI/MP/562456/sg90-tower-pro-micro-servo-motor.jpg' },
  { id: 5, name: '2WD Robot Car Chassis', category: 'Robotics Kit', price: 800, stock: 0, imageUrl: 'https://ibots.in/wp-content/uploads/2023/06/ibots-711919-01.jpg' },
];

const StockStatusBadge = ({ stock }) => {
    if (stock > 10) return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">In Stock</span>;
    if (stock > 0) return <span className="px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full">Low Stock</span>;
    return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Out of Stock</span>;
};

// --- Product Modal Component ---
const ProductModal = ({ product, onClose, onSave }) => {
    // In a real app, you'd use state to manage form inputs
    const isEditing = !!product;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><FaTimes size={20} /></button>
                </div>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Product Name</label>
                        <input type="text" defaultValue={product?.name} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Price (₹)</label>
                            <input type="number" defaultValue={product?.price} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Stock</label>
                            <input type="number" defaultValue={product?.stock} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Category</label>
                        <input type="text" defaultValue={product?.category} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Cancel</button>
                        <button type="submit" onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProductManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const filteredProducts = useMemo(() => 
        dummyProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [searchTerm]
    );

    const handleOpenModal = (product = null) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };
    
    const handleSaveProduct = (e) => {
      e.preventDefault();
      // Add save logic here
      console.log('Saving product...');
      handleCloseModal();
    }

  return (
    <div className="space-y-6">
        {isModalOpen && <ProductModal product={selectedProduct} onClose={handleCloseModal} onSave={handleSaveProduct}/>}
        
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Product Management</h1>
            <p className="text-slate-500 mt-1">Add, edit, and manage all products.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            <FaPlus className="mr-2" /> Add New Product
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="relative">
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt={product.name} />
                        <div className="ml-4 font-medium text-slate-900">{product.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{product.category}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">₹{product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                        <StockStatusBadge stock={product.stock} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-4">
                        <button onClick={() => handleOpenModal(product)} className="text-blue-600 hover:text-blue-900" title="Edit">
                            <FaPencilAlt />
                        </button>
                        <button className="text-red-600 hover:text-red-900" title="Delete">
                            <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;