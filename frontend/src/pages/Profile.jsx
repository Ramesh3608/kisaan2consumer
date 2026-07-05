import React, { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AccountLayout from "../components/AccountLayout";

function ProfileContent() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    upiId: user?.upiId || "",
    location: user?.location || "",
    farmName: user?.farmName || "",
    farmDescription: user?.farmDescription || "",
    city: user?.city || "",
    state: user?.state || "",
    zip: user?.zip || "",
  });
  const [saved, setSaved] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.put("/auth/profile", form);
    setUser(res.data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-2xl">👤</div>
        <div>
          <p className="font-semibold text-lg">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email} · <span className="capitalize">{user?.role}</span></p>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        {saved && <p className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg">Profile updated!</p>}
        <div>
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Phone Number</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">UPI ID</label>
          <input value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} placeholder="you@bank" className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Location</label>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2" />
        </div>

        {user?.role === "farmer" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Farm Name</label>
              <input value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Farm Description</label>
              <textarea value={form.farmDescription} onChange={(e) => setForm({ ...form, farmDescription: e.target.value })} rows={3} className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2" />
            </div>
          </>
        )}

        {user?.role === "agent" && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Service Area</label>
            <p className="text-xs text-gray-400 mb-2">
              Admin matches you to deliveries when this exactly matches a consumer's address.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} placeholder="Pincode" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        )}

        <button className="bg-brand-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-600">Save</button>
      </form>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  // Farmers/agents/admins don't have the consumer sidebar (no addresses/orders) —
  // show the plain profile form for them, sidebar layout for consumers.
  if (user?.role !== "consumer") {
    return <div className="max-w-2xl mx-auto px-4 py-8"><ProfileContent /></div>;
  }
  return (
    <AccountLayout>
      <ProfileContent />
    </AccountLayout>
  );
}
