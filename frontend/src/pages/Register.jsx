import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "consumer",
    farmName: "",
    location: "",
    city: "",
    state: "",
    zip: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await register(form);
      navigate("/verify-email", { state: { email: res.email, message: res.message } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-center mb-6">Create Your Account</h1>
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-8 space-y-4">
        {error && <p className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</p>}

        <div>
          <label className="text-sm font-medium text-gray-700">I am a...</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {[
              { v: "consumer", label: "🛍️ Consumer" },
              { v: "farmer", label: "🌾 Farmer" },
              { v: "agent", label: "🚚 Agent" },
            ].map((r) => (
              <button
                type="button"
                key={r.v}
                onClick={() => setForm({ ...form, role: r.v })}
                className={`text-sm py-2 rounded-lg border ${
                  form.role === r.v ? "bg-brand-500 text-white border-brand-500" : "border-gray-300 text-gray-600"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        {form.role === "farmer" && (
          <div>
            <label className="text-sm font-medium text-gray-700">Farm Name</label>
            <input value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })}
              placeholder="e.g. Green Valley Farms"
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Location</label>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="City, State"
            className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        {form.role === "agent" && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Service Area</label>
            <p className="text-xs text-gray-400 mb-2">Used to match you to nearby deliveries.</p>
            <div className="grid grid-cols-3 gap-2">
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} placeholder="Pincode"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        <button disabled={loading} className="w-full bg-brand-500 text-white py-2.5 rounded-full font-medium hover:bg-brand-600 transition-colors disabled:opacity-50">
          {loading ? "Creating account..." : "Sign Up"}
        </button>
        <p className="text-sm text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-brand-600 font-medium">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
