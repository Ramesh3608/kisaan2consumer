import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProductIcon from "./ProductIcon";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const cheapest = product.prices[0];

  const handleAdd = (e) => {
    e.preventDefault();
    if (user && user.role !== "consumer") return;
    if (!user) {
      navigate("/login");
      return;
    }
    addToCart({
      productId: product._id,
      name: product.name,
      image: product.image,
      category: product.category,
      weight: cheapest.weight,
      price: cheapest.price,
      qty,
      farmerName: product.farmer?.farmName || product.farmer?.name,
    });
  };

  return (
    <Link to={`/product/${product._id}`} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-4 block">
      <div className="relative">
        <div className="aspect-square rounded-xl bg-gray-50 flex items-center justify-center mb-3 overflow-hidden">
          <ProductIcon image={product.image} category={product.category} />
        </div>
        {product.organic && (
          <span className="absolute top-2 right-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
            Organic
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
          <span className="text-brand-600 font-bold">₹{cheapest.price}</span>
        </div>
        <p className="text-xs text-gray-500">{product.farmer?.farmName || product.farmer?.name}</p>
        {user?.role !== "farmer" && user?.role !== "admin" && user?.role !== "agent" && (
          <button
            onClick={handleAdd}
            className="w-full mt-2 bg-brand-500 text-white px-4 py-2 rounded-full hover:bg-brand-600 transition-colors text-sm font-medium"
          >
            🛒 Buy
          </button>
        )}
      </div>
    </Link>
  );
}
