import React, { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import ProductIcon from "../../components/ProductIcon";
import { fileToCompressedBase64 } from "../../utils/imageUpload";

const CATEGORIES = ["fruit", "vegetable", "seeds", "flowers", "nuts", "dairy", "beverages", "snacks"];
const NEXT_STATUS = { Pending: "Accepted", Accepted: "Packed", Packed: "Packed" };

function AddProductForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "vegetable",
    image: "",
    organic: false,
    stock: 100,
    harvestDate: "",
  });
  const [weights, setWeights] = useState([{ weight: "1kg", price: "" }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const updateWeight = (idx, field, value) => {
    setWeights((w) => w.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    setUploading(true);
    try {
      const base64 = await fileToCompressedBase64(file);
      setForm((f) => ({ ...f, image: base64 }));
      setImagePreview(base64);
    } catch (err) {
      setImageError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, image: "" }));
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const prices = weights
      .filter((w) => w.weight && w.price)
      .map((w) => ({ weight: w.weight, price: Number(w.price) }));
    if (!prices.length) {
      setError("Add at least one weight/price option.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/products", { ...form, prices });
      setForm({ name: "", description: "", category: "vegetable", image: "", organic: false, stock: 100, harvestDate: "" });
      setWeights([{ weight: "1kg", price: "" }]);
      setImagePreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h3 className="font-semibold text-lg">Add New Product</h3>
      {error && <p className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</p>}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Product Image</label>
          {imagePreview ? (
            <div className="relative w-full aspect-square max-w-[220px] rounded-xl overflow-hidden border border-gray-200">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 w-7 h-7 rounded-full text-sm shadow"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full max-w-[220px] aspect-square border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition-colors">
              <span className="text-3xl mb-2">🖼️</span>
              <span className="text-brand-600 text-sm font-medium">
                {uploading ? "Uploading..." : "Upload an image"}
              </span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
            </label>
          )}
          {imageError && <p className="text-red-600 text-xs mt-2">{imageError}</p>}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Product Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 capitalize">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Product Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" checked={form.organic} onChange={(e) => setForm({ ...form, organic: e.target.checked })} id="organic" />
          <label htmlFor="organic" className="text-sm">Organic</label>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Available Stock</label>
          <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Harvest Date</label>
          <input type="date" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })} className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Weights & Prices</label>
        {weights.map((w, idx) => (
          <div key={idx} className="flex gap-3 mb-2">
            <input placeholder="Weight (e.g. 500gms)" value={w.weight} onChange={(e) => updateWeight(idx, "weight", e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Price ₹" type="number" value={w.price} onChange={(e) => updateWeight(idx, "price", e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            {weights.length > 1 && (
              <button type="button" onClick={() => setWeights((ws) => ws.filter((_, i) => i !== idx))} className="text-red-500">✕</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setWeights((ws) => [...ws, { weight: "", price: "" }])} className="text-brand-600 text-sm font-medium">
          + Add More Weights
        </button>
      </div>

      <button disabled={saving} className="bg-brand-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-600 disabled:opacity-50">
        {saving ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
}

function ManageProducts({ products, onChanged }) {
  const del = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    onChanged();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Prices</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((p) => (
            <tr key={p._id}>
              <td className="px-4 py-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 shrink-0">
                  <ProductIcon image={p.image} category={p.category} className="text-xl" />
                </span>
                {p.name}
              </td>
              <td className="px-4 py-3 capitalize">{p.category}</td>
              <td className="px-4 py-3">{p.prices.map((pr) => `₹${pr.price}/${pr.weight}`).join(" | ")}</td>
              <td className="px-4 py-3">{p.stock}</td>
              <td className="px-4 py-3">
                <button onClick={() => del(p._id)} className="text-red-500">🗑</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan={5} className="text-center text-gray-400 py-8">No products yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function FarmerOrders({ orders, onChanged }) {
  const advance = async (order) => {
    const next = NEXT_STATUS[order.status] || order.status;
    await api.put(`/orders/${order._id}/status`, { status: next });
    onChanged();
  };

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o._id} className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs text-gray-400">Order #{o._id}</p>
              <p className="text-sm text-gray-600">Buyer: {o.consumer?.name} · {o.consumer?.phone}</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 font-medium">{o.status}</span>
          </div>
          <div className="text-sm text-gray-600 mb-3">
            {o.items.filter((i) => true).map((i, idx) => (
              <p key={idx}>{i.name} × {i.qty} ({i.weight})</p>
            ))}
          </div>
          {["Pending", "Accepted"].includes(o.status) && (
            <button onClick={() => advance(o)} className="bg-brand-500 text-white px-4 py-1.5 rounded-full text-sm font-medium">
              Mark as {NEXT_STATUS[o.status]}
            </button>
          )}
        </div>
      ))}
      {orders.length === 0 && <p className="text-center text-gray-400 py-8">No orders yet.</p>}
    </div>
  );
}

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const loadProducts = () => api.get("/products/farmer/mine").then((res) => setProducts(res.data));
  const loadOrders = () => api.get("/orders/farmer").then((res) => setOrders(res.data));

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const totalSales = orders
    .filter((o) => o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.items.filter((i) => i.farmer === user._id || i.farmer?._id === user._id).reduce((s, i) => s + i.price * i.qty, 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Welcome, {user?.farmName || user?.name} 🌾</h1>
      <p className="text-gray-500 mb-6">Manage your produce listings and incoming orders.</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Active Listings</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Orders Received</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Est. Revenue</p>
          <p className="text-2xl font-bold text-brand-600">₹{totalSales.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {[
          { k: "overview", l: "Add Product" },
          { k: "products", l: "Manage Products" },
          { k: "orders", l: "Orders" },
        ].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`px-4 py-2 text-sm font-medium ${tab === t.k ? "text-brand-600 border-b-2 border-brand-500" : "text-gray-500"}`}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === "overview" && <AddProductForm onCreated={() => { loadProducts(); setTab("products"); }} />}
      {tab === "products" && <ManageProducts products={products} onChanged={loadProducts} />}
      {tab === "orders" && <FarmerOrders orders={orders} onChanged={loadOrders} />}
    </div>
  );
}
