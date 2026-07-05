import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const dest =
        location.state?.from ||
        (user.role === "farmer" ? "/farmer" : user.role === "admin" ? "/admin" : user.role === "agent" ? "/agent" : "/");
      navigate(dest);
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        navigate("/verify-email", { state: { email: err.response.data.email, message: err.response.data.message } });
        return;
      }
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-8 space-y-4">
        {error && <p className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</p>}
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <button
          disabled={loading}
          className="w-full bg-brand-500 text-white py-2.5 rounded-full font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-sm text-center text-gray-600">
          Don't have an account? <Link to="/register" className="text-brand-600 font-medium">Sign up</Link>
        </p>
      </form>

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600">
        <p className="font-semibold mb-2">Demo accounts (after running `npm run seed` in backend):</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => fillDemo("consumer@k2c.com", "consumer123")} className="text-left hover:text-brand-600">👤 Consumer: consumer@k2c.com / consumer123</button>
          <button type="button" onClick={() => fillDemo("farmer@k2c.com", "farmer123")} className="text-left hover:text-brand-600">🌾 Farmer: farmer@k2c.com / farmer123</button>
          <button type="button" onClick={() => fillDemo("agent@k2c.com", "agent123")} className="text-left hover:text-brand-600">🚚 Agent: agent@k2c.com / agent123</button>
          <button type="button" onClick={() => fillDemo("chkramesh202021@gmail.com", "Ramesh@6777")} className="text-left hover:text-brand-600">🛠️ Admin: chkramesh202021@gmail.com</button>
        </div>
      </div>
    </div>
  );
}
