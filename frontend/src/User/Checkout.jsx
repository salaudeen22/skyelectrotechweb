import React from 'react';

const Checkout = () => {
  return (
    <div className="bg-slate-50 py-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-slate-900 text-center mb-8">Secure Checkout</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Shipping and Payment Form */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8 space-y-8">
                    <form className="space-y-6">
                        {/* Contact Information */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Contact Information</h2>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                                <input type="email" id="email" placeholder="you@example.com" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                            </div>
                        </div>
                        
                        {/* Shipping Address */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Shipping Address</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="First Name" className="col-span-1 border-slate-300 rounded-md sm:text-sm"/>
                                <input placeholder="Last Name" className="col-span-1 border-slate-300 rounded-md sm:text-sm"/>
                                <input placeholder="Address" className="col-span-2 border-slate-300 rounded-md sm:text-sm"/>
                                <input placeholder="City" className="col-span-1 border-slate-300 rounded-md sm:text-sm"/>
                                <input placeholder="PIN Code" className="col-span-1 border-slate-300 rounded-md sm:text-sm"/>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Payment Method</h2>
                            <select className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option>Credit / Debit Card</option>
                                <option>UPI</option>
                                <option>Cash on Delivery</option>
                            </select>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 sticky top-28">
                     <h2 className="text-xl font-bold border-b pb-4 mb-4">Order Summary</h2>
                     {/* In a real app, map through cart items here */}
                     <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-600">1 x Arduino Uno R3</p>
                            <p className="font-semibold">₹550.00</p>
                        </div>
                         <div className="flex justify-between items-start">
                            <p className="text-slate-600">2 x ESP32 Dev Board</p>
                            <p className="font-semibold">₹1500.00</p>
                        </div>
                     </div>
                     <div className="border-t mt-4 pt-4 space-y-3">
                        <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹2050.00</span></div>
                        <div className="flex justify-between text-slate-600"><span>Shipping</span><span>₹50.00</span></div>
                        <div className="flex justify-between font-bold text-slate-900 text-lg"><span>Total</span><span>₹2100.00</span></div>
                    </div>
                    <button className="mt-6 w-full block text-center bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">
                        Place Order
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Checkout;