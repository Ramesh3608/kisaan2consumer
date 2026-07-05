import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ProductIcon from "../components/ProductIcon";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { items, updateQty, removeFromCart, subtotal, shippingFee, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const goCheckout = () => {
    if (!user) return navigate("/login", { state: { from: "/checkout" } });
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse fresh produce and add items to your cart.</p>
        <Link to="/shop" className="bg-brand-500 text-white px-6 py-3 rounded-full font-medium hover:bg-brand-600">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.productId + item.weight} className="flex items-center gap-4 p-4">
            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl overflow-hidden">
              <ProductIcon image={item.image} category={item.category} className="" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">{item.weight} · {item.farmerName}</p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => updateQty(item.productId, item.weight, item.qty - 1)} className="w-7 h-7 rounded border border-gray-300 text-sm">-</button>
                <span className="text-sm w-6 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.productId, item.weight, item.qty + 1)} className="w-7 h-7 rounded border border-gray-300 text-sm">+</button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">₹{(item.price * item.qty).toFixed(2)}</p>
              <button onClick={() => removeFromCart(item.productId, item.weight)} className="text-red-500 text-sm mt-1">🗑</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
        <h3 className="font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal ({items.length} items)</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping Fee</span><span>₹{shippingFee.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100"><span>Total</span><span className="text-brand-600">₹{total.toFixed(2)}</span></div>
        </div>
        <button onClick={goCheckout} className="w-full mt-6 bg-brand-500 text-white py-3 rounded-full font-medium hover:bg-brand-600 transition-colors">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
