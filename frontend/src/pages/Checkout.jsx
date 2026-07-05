import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Checkout() {
  const { items, subtotal, shippingFee, total, clearCart } = useCart();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [selectedAddr, setSelectedAddr] = useState(addresses[0]?._id || "");
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [newAddr, setNewAddr] = useState({ label: "Home", fullName: user?.name || "", street: "", city: "", state: "", zip: "", phone: user?.phone || "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const saveAddress = async (e) => {
    e.preventDefault();
    const res = await api.post("/auth/address", newAddr);
    setAddresses(res.data);
    setSelectedAddr(res.data[res.data.length - 1]._id);
    setShowForm(false);
  };

  const handlePay = async () => {
    setError("");
    const addr = addresses.find((a) => a._id === selectedAddr);
    if (!addr) {
      setError("Please select or add a delivery address.");
      return;
    }
    setProcessing(true);

    try {
      const { data: rzpOrder } = await api.post("/payment/create-order", { amount: total });

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded && !rzpOrder.mock) {
        setError("Failed to load payment gateway. Check your internet connection.");
        setProcessing(false);
        return;
      }

      const completeOrder = async (paymentId, razorpayOrderId) => {
        const orderPayload = {
          items: items.map((i) => ({ productId: i.productId, weight: i.weight, qty: i.qty })),
          shippingAddress: addr,
          paymentId,
          razorpayOrderId,
        };
        const res = await api.post("/orders", orderPayload);
        clearCart();
        navigate("/orders", { state: { success: true, orderId: res.data._id } });
      };

      if (rzpOrder.mock) {
        // Razorpay keys not configured on the backend — simulate a successful
        // test-mode payment so the full flow can still be exercised locally.
        const verifyRes = await api.post("/payment/verify", { mock: true });
        await completeOrder(verifyRes.data.paymentId, rzpOrder.id);
        return;
      }

      const options = {
        key: rzpOrder.key,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "FarmFresh",
        description: "Order Payment",
        order_id: rzpOrder.id,
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.data.verified) {
              await completeOrder(verifyRes.data.paymentId, response.razorpay_order_id);
            } else {
              setError("Payment verification failed.");
            }
          } catch (err) {
            setError("Payment verification failed.");
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: { color: "#2e7d32" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Shipping Address</h3>
              <button onClick={() => setShowForm((s) => !s)} className="text-brand-600 text-sm font-medium">
                {showForm ? "Cancel" : "+ Add new"}
              </button>
            </div>

            {addresses.map((a) => (
              <label key={a._id} className={`block border rounded-xl p-4 mb-3 cursor-pointer ${selectedAddr === a._id ? "border-brand-500 bg-brand-50" : "border-gray-200"}`}>
                <input type="radio" name="addr" className="mr-2" checked={selectedAddr === a._id} onChange={() => setSelectedAddr(a._id)} />
                <span className="font-medium">{a.label}</span>
                <p className="text-sm text-gray-600 ml-6">{a.fullName}, {a.street}, {a.city}, {a.state} {a.zip}</p>
                <p className="text-sm text-gray-500 ml-6">📞 {a.phone}</p>
              </label>
            ))}

            {showForm && (
              <form onSubmit={saveAddress} className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Label (Home, Office)" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  <input placeholder="Full Name" required value={newAddr.fullName} onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <input placeholder="Street Address" required value={newAddr.street} onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <div className="grid grid-cols-3 gap-3">
                  <input placeholder="City" required value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  <input placeholder="State" required value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  <input placeholder="ZIP" required value={newAddr.zip} onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <input placeholder="Phone Number" required value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <button className="bg-brand-500 text-white px-6 py-2 rounded-full text-sm font-medium">Save Address</button>
              </form>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Payment Method</h3>
            <div className="border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
              <p className="mb-2">💳 Razorpay Secure Checkout (Test Mode)</p>
              <p className="text-xs text-gray-400">
                Use Razorpay's test card <span className="font-mono">4111 1111 1111 1111</span>, any future
                expiry, any CVV, and any OTP to simulate a successful payment.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
          <h3 className="font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            {items.map((i) => (
              <div key={i.productId + i.weight} className="flex justify-between text-gray-600">
                <span>{i.name} × {i.qty}</span>
                <span>₹{(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>₹{shippingFee.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100"><span>Total</span><span className="text-brand-600">₹{total.toFixed(2)}</span></div>
          </div>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          <button onClick={handlePay} disabled={processing} className="w-full mt-6 bg-brand-500 text-white py-3 rounded-full font-medium hover:bg-brand-600 transition-colors disabled:opacity-50">
            {processing ? "Processing..." : `Pay Now ₹${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
