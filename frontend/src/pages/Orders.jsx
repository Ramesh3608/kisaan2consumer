import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import ProductIcon from "../components/ProductIcon";
import AccountLayout from "../components/AccountLayout";

const STATUS_STEPS = ["Pending", "Accepted", "Packed", "Assigned", "Picked Up", "Out for Delivery", "Delivered"];

function StatusBadge({ status }) {
  const colors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Accepted: "bg-blue-100 text-blue-700",
    Packed: "bg-indigo-100 text-indigo-700",
    Assigned: "bg-purple-100 text-purple-700",
    "Picked Up": "bg-cyan-100 text-cyan-700",
    "Out for Delivery": "bg-orange-100 text-orange-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };
  return <span className={`text-xs px-3 py-1 rounded-full font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
}

export default function Orders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/orders/mine").then((res) => setOrders(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const submitReview = async (order) => {
    const farmerId = order.items[0]?.farmer;
    await api.post("/reviews", { farmerId, orderId: order._id, rating, comment });
    setReviewing(null);
    setComment("");
    setRating(5);
  };

  return (
    <AccountLayout>
      <h1 className="text-2xl font-bold mb-2">My Orders</h1>

      {location.state?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm">
          ✅ Payment successful! Your order has been placed.
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 py-16 text-center">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400 py-16 text-center">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Order #{order._id}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <ProductIcon image="" category="" className="text-2xl" />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty} · {item.weight}</p>
                    </div>
                    <p className="font-medium">₹{(item.price * item.qty).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="text-sm text-gray-500 mb-4">
                <p>Shipping to: {order.shippingAddress?.fullName}, {order.shippingAddress?.city}</p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <p className="font-bold">Total: ₹{order.total.toFixed(2)}</p>
                {order.status === "Delivered" && (
                  <button onClick={() => setReviewing(order._id)} className="text-brand-600 text-sm font-medium">
                    ⭐ Rate this farmer
                  </button>
                )}
              </div>

              {reviewing === order._id && (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRating(n)} className="text-2xl">
                        {n <= rating ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a short review..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
                  <button onClick={() => submitReview(order)} className="bg-brand-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Submit Review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
