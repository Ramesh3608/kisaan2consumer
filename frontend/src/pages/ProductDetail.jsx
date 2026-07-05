import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import ProductIcon from "../components/ProductIcon";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => {
      setData(res.data);
      setSelectedPrice(res.data.product.prices[0]);
    });
  }, [id]);

  useEffect(() => {
    if (data?.product?.farmer?._id) {
      api.get(`/reviews/farmer/${data.product.farmer._id}`).then((res) => setReviews(res.data));
    }
  }, [data]);

  if (!data) return <p className="text-center py-16 text-gray-400">Loading...</p>;
  const { product, related } = data;

  const handleAdd = () => {
    if (!user) return navigate("/login");
    addToCart({
      productId: product._id,
      name: product.name,
      image: product.image,
      category: product.category,
      weight: selectedPrice.weight,
      price: selectedPrice.price,
      qty,
      farmerName: product.farmer?.farmName || product.farmer?.name,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {added && (
        <div className="fixed top-20 right-6 bg-white shadow-lg border border-green-200 rounded-lg px-4 py-3 text-sm z-50">
          ✅ Item added to cart.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-gray-50 rounded-2xl flex items-center justify-center aspect-square overflow-hidden">
          <span className="text-[10rem] leading-none w-full h-full flex items-center justify-center">
            <ProductIcon image={product.image} category={product.category} className="" />
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-600">Description: {product.description || "Fresh farm produce."}</p>
          <p className="text-sm text-gray-500">
            Sold by{" "}
            <Link to="#" className="text-brand-600 font-medium">
              {product.farmer?.farmName || product.farmer?.name}
            </Link>{" "}
            {product.farmer?.ratingCount > 0 && <>⭐ {product.farmer.ratingAvg} ({product.farmer.ratingCount})</>}
          </p>

          <div className="flex flex-wrap gap-3">
            {product.prices.map((p) => (
              <button
                key={p.weight}
                onClick={() => setSelectedPrice(p)}
                className={`border rounded-xl px-4 py-2 text-sm ${
                  selectedPrice?.weight === p.weight ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-300"
                }`}
              >
                <div className="font-bold">₹{p.price}</div>
                <div className="text-xs text-gray-500">{p.weight}</div>
              </button>
            ))}
          </div>

          {user?.role !== "farmer" && user?.role !== "admin" && user?.role !== "agent" && (
            <>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg border border-gray-300">-</button>
                <span className="w-8 text-center">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 rounded-lg border border-gray-300">+</button>
              </div>
              <button onClick={handleAdd} className="w-full bg-brand-500 text-white py-3 rounded-full font-medium hover:bg-brand-600 transition-colors">
                🛒 Add to Cart
              </button>
            </>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="mt-12">
          <h3 className="font-semibold text-lg mb-4">Reviews for this farmer</h3>
          <div className="space-y-3">
            {reviews.slice(0, 5).map((r) => (
              <div key={r._id} className="bg-white border border-gray-100 rounded-xl p-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{r.consumer?.name}</span>
                  <span>{"⭐".repeat(r.rating)}</span>
                </div>
                {r.comment && <p className="text-gray-600 mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {related?.length > 0 && (
        <div className="mt-12">
          <h3 className="font-semibold text-lg mb-4">Related Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
