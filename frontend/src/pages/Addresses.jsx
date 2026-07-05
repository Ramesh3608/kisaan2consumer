import React, { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AccountLayout from "../components/AccountLayout";

export default function Addresses() {
  const { user, setUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: "Home",
    fullName: user?.name || "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: user?.phone || "",
  });

  const addAddress = async (e) => {
    e.preventDefault();
    const res = await api.post("/auth/address", form);
    setUser({ ...user, addresses: res.data });
    setForm({ label: "Home", fullName: user?.name || "", street: "", city: "", state: "", zip: "", phone: user?.phone || "" });
    setShowForm(false);
  };

  const deleteAddress = async (id) => {
    const res = await api.delete(`/auth/address/${id}`);
    setUser({ ...user, addresses: res.data });
  };

  return (
    <AccountLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        <button onClick={() => setShowForm((s) => !s)} className="bg-brand-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-600">
          {showForm ? "Cancel" : "+ Add New Address"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addAddress} className="bg-white rounded-2xl shadow-sm p-6 space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Label (Home, Office)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Full Name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <input placeholder="Street Address" required value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="State" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="ZIP" required value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <input placeholder="Phone Number" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button className="bg-brand-500 text-white px-6 py-2 rounded-full text-sm font-medium">Save Address</button>
        </form>
      )}

      <div className="space-y-3">
        {user?.addresses?.length === 0 && !showForm && (
          <p className="text-gray-400 text-sm bg-white rounded-2xl shadow-sm p-6 text-center">
            No saved addresses yet. Add one to speed up checkout.
          </p>
        )}
        {user?.addresses?.map((a) => (
          <div key={a._id} className="bg-white rounded-2xl shadow-sm p-5 flex justify-between items-start">
            <div className="text-sm">
              <p className="font-semibold mb-1">{a.label}</p>
              <p className="text-gray-600">{a.fullName}, {a.street}, {a.city}, {a.state} {a.zip}</p>
              <p className="text-gray-500 mt-1">📞 {a.phone}</p>
            </div>
            <button onClick={() => deleteAddress(a._id)} className="text-red-500 text-sm font-medium">Remove</button>
          </div>
        ))}
      </div>
    </AccountLayout>
  );
}
