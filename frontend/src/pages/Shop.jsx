import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const TOP_TABS = ["all", "fruit", "vegetable", "seeds", "flowers", "nuts", "dairy", "beverages", "snacks"];
const SIDEBAR_CATEGORIES = ["fruit", "vegetable", "seeds", "flowers", "nuts"];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchQuery = searchParams.get("search") || "";

  // Top tab category (quick switch)
  const [topTab, setTopTab] = useState("all");

  // Sidebar filters — staged until "Apply Filters" is clicked, like the mockup
  const emptyFilters = { category: "", organicOnly: false, sort: "default" };
  const [pendingFilters, setPendingFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  const fetchProducts = () => {
    setLoading(true);
    const params = {};
    const effectiveCategory = appliedFilters.category || (topTab !== "all" ? topTab : "");
    if (effectiveCategory) params.category = effectiveCategory;
    if (appliedFilters.sort !== "default") params.sort = appliedFilters.sort;
    if (appliedFilters.organicOnly) params.organic = "true";
    if (searchQuery) params.search = searchQuery;

    api
      .get("/products", { params })
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [topTab, appliedFilters, searchQuery]);

  const handleTopTab = (c) => {
    setTopTab(c);
    setPendingFilters((f) => ({ ...f, category: "" }));
    setAppliedFilters((f) => ({ ...f, category: "" }));
  };

  const applyFilters = () => {
    setTopTab("all");
    setAppliedFilters(pendingFilters);
  };

  const clearFilters = () => {
    setPendingFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setTopTab("all");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-200">
        {TOP_TABS.map((c) => (
          <button
            key={c}
            onClick={() => handleTopTab(c)}
            className={`px-4 py-2 text-sm whitespace-nowrap rounded-t-lg font-medium capitalize ${
              topTab === c && !appliedFilters.category
                ? "text-brand-600 border-b-2 border-brand-500"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {c === "all" ? "All Products" : c}
          </button>
        ))}
      </div>

      {searchQuery && (
        <p className="text-sm text-gray-500 mb-4">
          Search results for "<span className="font-medium">{searchQuery}</span>"
        </p>
      )}

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar filters — matches the report mockup: Sort By, Categories (radio), Apply/Clear Filters */}
        <aside className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2 text-sm">Sort By</h4>
            <select
              value={pendingFilters.sort}
              onChange={(e) => setPendingFilters((f) => ({ ...f, sort: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="default">Default</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-sm">Categories</h4>
            <div className="space-y-2">
              {SIDEBAR_CATEGORIES.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm text-gray-700 capitalize cursor-pointer">
                  <input
                    type="radio"
                    name="sidebar-category"
                    checked={pendingFilters.category === c}
                    onChange={() => setPendingFilters((f) => ({ ...f, category: c }))}
                  />
                  {c}
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="sidebar-category"
                  checked={pendingFilters.organicOnly && !pendingFilters.category}
                  onChange={() => setPendingFilters((f) => ({ ...f, category: "", organicOnly: true }))}
                />
                Organic
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={applyFilters}
              className="w-full bg-brand-500 text-white py-2 rounded-full text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="w-full bg-gray-100 text-gray-600 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Products grid */}
        <div className="md:col-span-3">
          {loading ? (
            <p className="text-center text-gray-400 py-16">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-400 py-16">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
