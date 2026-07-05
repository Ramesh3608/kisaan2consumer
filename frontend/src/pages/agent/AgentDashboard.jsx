import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const NEXT_STATUS = {
  Assigned: "Picked Up",
  "Picked Up": "Out for Delivery",
  "Out for Delivery": "Delivered",
};

export default function AgentDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | sharing | shared | denied | unsupported

  const load = () => api.get("/orders/agent").then((res) => setOrders(res.data));
  useEffect(() => {
    load();
  }, []);

  // Share live GPS location so admin can assign the nearest agent to a delivery.
  const shareLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }
    setLocationStatus("sharing");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.put("/auth/location", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationStatus("shared");
        } catch {
          setLocationStatus("denied");
        }
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    shareLocation();
    // Refresh location every 3 minutes while the dashboard stays open
    const interval = setInterval(shareLocation, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const advance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    await api.put(`/orders/${order._id}/delivery-status`, { status: next });
    load();
  };

  const active = orders.filter((o) => o.status !== "Delivered");
  const completed = orders.filter((o) => o.status === "Delivered");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name} 🚚</h1>
      <p className="text-gray-500 mb-4">View and manage your assigned deliveries.</p>

      <div
        className={`rounded-xl px-4 py-3 mb-6 text-sm flex items-center justify-between ${
          locationStatus === "shared"
            ? "bg-green-50 text-green-700"
            : locationStatus === "denied" || locationStatus === "unsupported"
            ? "bg-yellow-50 text-yellow-700"
            : "bg-gray-50 text-gray-500"
        }`}
      >
        <span>
          {locationStatus === "shared" && "📍 Live location shared — admin can find you for nearby deliveries."}
          {locationStatus === "sharing" && "📍 Getting your location..."}
          {locationStatus === "denied" && "⚠️ Location access denied — admin won't be able to auto-assign you nearby orders."}
          {locationStatus === "unsupported" && "⚠️ Your browser doesn't support location sharing."}
          {locationStatus === "idle" && "📍 Location not shared yet."}
        </span>
        {(locationStatus === "denied" || locationStatus === "unsupported" || locationStatus === "idle") && (
          <button onClick={shareLocation} className="text-brand-600 font-medium whitespace-nowrap ml-3">
            Try again
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Active Deliveries</p>
          <p className="text-2xl font-bold">{active.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-brand-600">{completed.length}</p>
        </div>
      </div>

      <h3 className="font-semibold mb-3">Assigned Deliveries</h3>
      <div className="space-y-4">
        {active.map((o) => (
          <div key={o._id} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-gray-400">Order #{o._id}</p>
                <p className="text-sm text-gray-700 font-medium">{o.consumer?.name} · 📞 {o.consumer?.phone}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">{o.status}</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              📍 {o.shippingAddress?.street}, {o.shippingAddress?.city}, {o.shippingAddress?.state} {o.shippingAddress?.zip}
            </p>
            <p className="text-sm text-gray-600 mb-3">{o.items.length} item(s) · Total ₹{o.total.toFixed(2)}</p>
            {NEXT_STATUS[o.status] && (
              <button onClick={() => advance(o)} className="bg-brand-500 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                Mark as {NEXT_STATUS[o.status]}
              </button>
            )}
          </div>
        ))}
        {active.length === 0 && <p className="text-center text-gray-400 py-8">No active deliveries assigned right now.</p>}
      </div>

      {completed.length > 0 && (
        <>
          <h3 className="font-semibold mb-3 mt-8">Completed</h3>
          <div className="space-y-2">
            {completed.map((o) => (
              <div key={o._id} className="bg-white rounded-xl shadow-sm p-4 text-sm flex justify-between">
                <span>Order #{o._id} — {o.consumer?.name}</span>
                <span className="text-green-600 font-medium">Delivered</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
