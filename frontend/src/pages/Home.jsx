import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/products").then((res) => setFeatured(res.data.slice(0, 4)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-green-100">
        <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Fresh from the Farm
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Farm Fresh Products <br />
              <span className="text-brand-600">Directly from Farmers</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
              Connect directly with local farmers and get fresh, organic produce delivered to your
              doorstep. Support local agriculture while enjoying the finest quality crops.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors font-medium"
            >
              Shop Now →
            </Link>
            <div className="flex items-center gap-6 pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-brand-600">1000+</p>
                <p className="text-gray-600 text-sm">Farmers</p>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div className="text-center">
                <p className="text-3xl font-bold text-brand-600">50k+</p>
                <p className="text-gray-600 text-sm">Customers</p>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div className="text-center">
                <p className="text-3xl font-bold text-brand-600">100%</p>
                <p className="text-gray-600 text-sm">Organic</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center justify-center">
            <span className="text-9xl">🌱</span>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <span className="text-brand-600 font-medium text-sm">Our Products</span>
          <h2 className="text-3xl font-bold mt-2">Featured Fresh Produce</h2>
          <p className="text-gray-600 mt-2">Discover our selection of premium crops directly from local farmers</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
        {featured.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No products yet — seed the database or add products as a farmer.
          </p>
        )}
      </section>

      {/* How it works */}
      <section className="bg-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-brand-600 font-medium text-sm">Simple Process</span>
            <h2 className="text-3xl font-bold mt-2">How It Works</h2>
            <p className="text-gray-600 mt-2">Get fresh produce from farm to table in three easy steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🔍", title: "Browse Products", desc: "Explore our wide selection of fresh produce directly from local farmers in your area" },
              { icon: "🛒", title: "Place Your Order", desc: "Select your desired products and quantities from your preferred local farmers" },
              { icon: "🚚", title: "Get Fresh Delivery", desc: "Receive fresh produce delivered directly to your doorstep from the farm" },
            ].map((s) => (
              <div key={s.title} className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="w-12 h-12 bg-brand-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                  {s.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8 bg-white inline-block px-6 py-2 rounded-full mx-auto w-fit">
            <span className="block">All deliveries are guaranteed fresh and tracked in real-time</span>
          </p>
        </div>
      </section>
    </div>
  );
}
