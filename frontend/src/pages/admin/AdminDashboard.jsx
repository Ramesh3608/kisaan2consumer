import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function Overview({ stats }) {
  if (!stats) return null;
  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥" },
    { label: "Farmers", value: stats.totalFarmers, icon: "🌾" },
    { label: "Consumers", value: stats.totalConsumers, icon: "🛍️" },
    { label: "Delivery Agents", value: stats.totalAgents, icon: "🚚" },
    { label: "Products Listed", value: stats.totalProducts, icon: "📦" },
    { label: "Total Orders", value: stats.totalOrders, icon: "🧾" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: "⏳" },
    { label: "Revenue", value: `₹${stats.revenue}`, icon: "💰" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-2xl shadow-sm p-5">
          <div className="text-2xl mb-1">{c.icon}</div>
          <p className="text-2xl font-bold">{c.value}</p>
          <p className="text-sm text-gray-500">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

function Users({ users, onChanged }) {
  const [roleFilter, setRoleFilter] = useState("all");
  const toggleBan = async (id) => {
    await api.put(`/admin/users/${id}/ban`);
    onChanged();
  };
  const filtered = roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex gap-2">
        {["all", "consumer", "farmer", "agent", "admin"].map((r) => (
          <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${roleFilter === r ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600"}`}>
            {r}
          </button>
        ))}
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filtered.map((u) => (
            <tr key={u._id}>
              <td className="px-4 py-3">{u.name}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3 capitalize">{u.role}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs ${u.isBanned ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                  {u.isBanned ? "Banned" : "Active"}
                </span>
              </td>
              <td className="px-4 py-3">
                {u.role !== "admin" && (
                  <button onClick={() => toggleBan(u._id)} className="text-brand-600 font-medium">
                    {u.isBanned ? "Unban" : "Ban"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductsAdmin({ products, onChanged }) {
  const toggle = async (id) => {
    await api.put(`/admin/products/${id}/toggle`);
    onChanged();
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Farmer</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((p) => (
            <tr key={p._id}>
              <td className="px-4 py-3">{p.name}</td>
              <td className="px-4 py-3">{p.farmer?.farmName || p.farmer?.name}</td>
              <td className="px-4 py-3 capitalize">{p.category}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs ${p.isActive ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600"}`}>
                  {p.isActive ? "Active" : "Hidden"}
                </span>
              </td>
              <td className="px-4 py-3">
                <button onClick={() => toggle(p._id)} className="text-brand-600 font-medium">
                  {p.isActive ? "Hide" : "Show"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersAdmin({ orders, agents, onChanged }) {
  const [nearestData, setNearestData] = useState({}); // orderId -> { agents, orderLocationKnown }
  const [loadingNearest, setLoadingNearest] = useState({});
  const [assigning, setAssigning] = useState({});
  const [errorMsg, setErrorMsg] = useState({});

  const loadNearest = async (orderId) => {
    setLoadingNearest((s) => ({ ...s, [orderId]: true }));
    try {
      const res = await api.get(`/orders/${orderId}/nearest-agents`);
      setNearestData((s) => ({ ...s, [orderId]: res.data }));
    } catch (err) {
      setErrorMsg((s) => ({ ...s, [orderId]: err.response?.data?.message || "Failed to load agents" }));
    } finally {
      setLoadingNearest((s) => ({ ...s, [orderId]: false }));
    }
  };

  const assign = async (orderId, agentId) => {
    if (!agentId) return;
    await api.put(`/orders/${orderId}/assign`, { agentId });
    onChanged();
  };

  const assignNearest = async (orderId) => {
    setAssigning((s) => ({ ...s, [orderId]: true }));
    setErrorMsg((s) => ({ ...s, [orderId]: "" }));
    try {
      const res = await api.put(`/orders/${orderId}/assign-nearest`);
      onChanged();
      alert(`✅ Assigned ${res.data.assignedAgent} — ${res.data.distanceKm} km away`);
    } catch (err) {
      setErrorMsg((s) => ({ ...s, [orderId]: err.response?.data?.message || "Could not auto-assign" }));
    } finally {
      setAssigning((s) => ({ ...s, [orderId]: false }));
    }
  };

  const assignMatching = async (orderId) => {
    setAssigning((s) => ({ ...s, [orderId]: true }));
    setErrorMsg((s) => ({ ...s, [orderId]: "" }));
    try {
      const res = await api.put(`/orders/${orderId}/assign-matching`);
      onChanged();
      alert(`✅ Assigned ${res.data.assignedAgent} — city, state & pincode match`);
    } catch (err) {
      setErrorMsg((s) => ({ ...s, [orderId]: err.response?.data?.message || "Could not auto-assign" }));
    } finally {
      setAssigning((s) => ({ ...s, [orderId]: false }));
    }
  };

  const autoAssign = async (orderId) => {
    setAssigning((s) => ({ ...s, [orderId]: true }));
    setErrorMsg((s) => ({ ...s, [orderId]: "" }));
    try {
      const res = await api.put(`/orders/${orderId}/auto-assign`);
      onChanged();
      if (res.data.method === "area_match") {
        alert(`✅ Assigned ${res.data.assignedAgent} — exact area match`);
      } else {
        alert(`✅ Assigned ${res.data.assignedAgent} — ${res.data.distanceKm} km away (GPS nearest, no area match found)`);
      }
    } catch (err) {
      setErrorMsg((s) => ({ ...s, [orderId]: err.response?.data?.message || "Could not auto-assign" }));
    } finally {
      setAssigning((s) => ({ ...s, [orderId]: false }));
    }
  };

  const areaBadge = (match) => {
    if (match === "exact") return <span className="text-green-600 text-xs font-medium">🎯 Exact area match</span>;
    if (match === "city") return <span className="text-blue-600 text-xs font-medium">🏙️ Same city</span>;
    if (match === "state") return <span className="text-gray-400 text-xs">Same state</span>;
    return null;
  };

  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const nearby = nearestData[o._id];
        return (
          <div key={o._id} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-gray-400">Order #{o._id}</p>
                <p className="text-sm text-gray-600">Buyer: {o.consumer?.name}</p>
                <p className="text-xs text-gray-400">
                  📍 {o.shippingAddress?.city}, {o.shippingAddress?.state}
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 font-medium">{o.status}</span>
            </div>
            <p className="font-semibold mb-3">Total: ₹{o.total.toFixed(2)}</p>

            {!o.agent && !["Delivered", "Cancelled"].includes(o.status) && (
              <div className="space-y-2">
                {!nearby && (
                  <button
                    onClick={() => loadNearest(o._id)}
                    disabled={loadingNearest[o._id]}
                    className="text-sm text-brand-600 font-medium"
                  >
                    {loadingNearest[o._id] ? "Finding nearby agents..." : "📍 Find nearest agent"}
                  </button>
                )}

                {nearby && (
                  <div className="border border-gray-100 rounded-xl p-3 space-y-2">
                    {!nearby.orderLocationKnown && (
                      <p className="text-xs text-yellow-600">
                        ⚠️ Couldn't determine exact delivery coordinates (geocoding may not be configured) —
                        showing agents without distance.
                      </p>
                    )}
                    <ul className="text-sm space-y-1">
                      {nearby.agents.map((a) => (
                        <li key={a._id} className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            🚚 {a.name}
                            {!a.locationKnown && <span className="text-gray-400 text-xs">(GPS unknown)</span>}
                            {areaBadge(a.areaMatch)}
                          </span>
                          <span className="flex items-center gap-2">
                            {a.distanceKm !== null && (
                              <span className="text-gray-500 text-xs">{a.distanceKm} km</span>
                            )}
                            <button
                              onClick={() => assign(o._id, a._id)}
                              className="text-brand-600 text-xs font-medium border border-brand-200 rounded-full px-2 py-0.5 hover:bg-brand-50"
                            >
                              Assign
                            </button>
                          </span>
                        </li>
                      ))}
                      {nearby.agents.length === 0 && <li className="text-gray-400 text-sm">No agents available.</li>}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => autoAssign(o._id)}
                    disabled={assigning[o._id]}
                    className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-black disabled:opacity-50 shadow-sm"
                  >
                    {assigning[o._id] ? "Assigning..." : "🚀 Auto-Assign Agent"}
                  </button>
                  <button
                    onClick={() => assignMatching(o._id)}
                    disabled={assigning[o._id]}
                    className="bg-brand-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                  >
                    {assigning[o._id] ? "Assigning..." : "🎯 Assign Matching Agent"}
                  </button>
                  <button
                    onClick={() => assignNearest(o._id)}
                    disabled={assigning[o._id]}
                    className="bg-brand-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-brand-600 disabled:opacity-50"
                  >
                    {assigning[o._id] ? "Assigning..." : "⚡ Assign Nearest Agent"}
                  </button>
                  <select onChange={(e) => assign(o._id, e.target.value)} defaultValue="" className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                    <option value="" disabled>Or pick manually...</option>
                    {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                </div>
                <p className="text-xs text-gray-400">
                  🚀 Recommended: tries area match first, falls back to GPS · 🎯 Matches city/state/pincode ·
                  ⚡ Uses live GPS distance
                </p>

                {errorMsg[o._id] && <p className="text-red-600 text-xs">{errorMsg[o._id]}</p>}
              </div>
            )}

            {o.agent && <p className="text-sm text-gray-500">Agent: {o.agent.name}</p>}
          </div>
        );
      })}
      {orders.length === 0 && <p className="text-center text-gray-400 py-8">No orders yet.</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const loadStats = () => api.get("/admin/stats").then((res) => setStats(res.data));
  const loadUsers = () => api.get("/admin/users").then((res) => setUsers(res.data));
  const loadProducts = () => api.get("/admin/products").then((res) => setProducts(res.data));
  const loadOrders = () => api.get("/orders").then((res) => setOrders(res.data));

  useEffect(() => {
    loadStats();
    loadUsers();
    loadProducts();
    loadOrders();
  }, []);

  const agents = users.filter((u) => u.role === "agent");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Admin Dashboard 🛠️</h1>
      <p className="text-gray-500 mb-6">Oversee users, listings, and order fulfillment.</p>

      <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { k: "overview", l: "Overview" },
          { k: "users", l: "Manage Users" },
          { k: "products", l: "Manage Listings" },
          { k: "orders", l: "Orders & Logistics" },
        ].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${tab === t.k ? "text-brand-600 border-b-2 border-brand-500" : "text-gray-500"}`}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview stats={stats} />}
      {tab === "users" && <Users users={users} onChanged={() => { loadUsers(); loadStats(); }} />}
      {tab === "products" && <ProductsAdmin products={products} onChanged={loadProducts} />}
      {tab === "orders" && <OrdersAdmin orders={orders} agents={agents} onChanged={loadOrders} />}
    </div>
  );
}
