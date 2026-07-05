import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(search)}`);
  };

  const dashboardLink = () => {
    if (!user) return null;
    if (user.role === "farmer") return { to: "/farmer", label: "My Farm" };
    if (user.role === "admin") return { to: "/admin", label: "Admin" };
    if (user.role === "agent") return { to: "/agent", label: "Deliveries" };
    return null;
  };

  const dash = dashboardLink();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-brand-600 font-bold text-xl shrink-0">
          <span>🌱</span> FarmFresh
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <Link to="/shop" className="hover:text-brand-600">Shop</Link>
          <Link to="/about" className="hover:text-brand-600">About</Link>
          <Link to="/contact" className="hover:text-brand-600">Contact</Link>
        </nav>

        <form onSubmit={handleSearch} className="hidden sm:block flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </form>

        <div className="flex items-center gap-4">
          {dash && (
            <Link to={dash.to} className="hidden md:block text-sm font-medium text-brand-600 hover:underline">
              {dash.label}
            </Link>
          )}

          {user?.role !== "farmer" && user?.role !== "admin" && user?.role !== "agent" && (
            <Link to="/cart" className="relative">
              <span className="text-xl">🛒</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="text-xl">👤</button>
            {menuOpen && (
              <div
                onMouseLeave={() => setMenuOpen(false)}
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 text-sm"
              >
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>My Profile</Link>
                    {user.role === "consumer" && (
                      <Link to="/orders" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>My Orders</Link>
                    )}
                    {dash && (
                      <Link to={dash.to} className="block px-4 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>{dash.label}</Link>
                    )}
                    <button
                      onClick={() => { logout(); setMenuOpen(false); navigate("/"); }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Login</Link>
                    <Link to="/register" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
