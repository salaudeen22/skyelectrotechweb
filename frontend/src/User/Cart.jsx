import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaMinus, FaTrash, FaShoppingCart } from 'react-icons/fa';

// --- Data with images ---
const dummyCart = [
  { id: 1, name: 'Arduino Uno R3', price: 550, qty: 2, imageUrl: 'https://www.theengineerstore.in/cdn/shop/products/arduino-uno-r3-1.png?v=1701086206' },
  { id: 2, name: 'ESP32 Dev Board', price: 750, qty: 1, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuBZkNT4gPIhsPepZy6C4e-SZ_0Y7T4St__g&s' },
];

const Cart = () => {
  const subtotal = dummyCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = 50;
  const total = subtotal + shipping;

  if (dummyCart.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <FaShoppingCart className="text-6xl text-slate-300 mb-4" />
              <h1 className="text-3xl font-bold text-slate-800">Your cart is empty</h1>
              <p className="text-slate-500 mt-2">Looks like you haven't added anything to your cart yet.</p>
              <Link to="/products" className="mt-6 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                  Continue Shopping
              </Link>
          </div>
      );
  }

  return (
    <div className="bg-slate-50 py-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Your Shopping Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Cart Items */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 space-y-6">
                    {dummyCart.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 border-b border-slate-200 pb-6 last:border-b-0">
                            <img src={item.imageUrl} alt={item.name} className="w-24 h-24 rounded-lg object-cover"/>
                            <div className="flex-grow">
                                <h2 className="font-bold text-slate-800">{item.name}</h2>
                                <p className="text-sm text-slate-500">Price: ₹{item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button className="p-1 rounded-full bg-slate-200 hover:bg-slate-300"><FaMinus size={12}/></button>
                                <span className="font-bold w-8 text-center">{item.qty}</span>
                                <button className="p-1 rounded-full bg-slate-200 hover:bg-slate-300"><FaPlus size={12}/></button>
                            </div>
                            <p className="font-bold text-slate-800 w-24 text-right">₹{(item.price * item.qty).toFixed(2)}</p>
                            <button className="text-slate-400 hover:text-red-500"><FaTrash /></button>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 sticky top-28">
                    <h2 className="text-xl font-bold border-b pb-4 mb-4">Order Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-slate-600"><span>Shipping</span><span>₹{shipping.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-slate-900 text-lg border-t pt-3 mt-3"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                    </div>
                    <Link to="/checkout" className="mt-6 w-full block text-center bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">
                        Proceed to Checkout
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Cart;