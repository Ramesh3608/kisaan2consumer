import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/profile", label: "My Profile", icon: "👤" },
  { to: "/addresses", label: "My Addresses", icon: "📍" },
  { to: "/orders", label: "My Orders", icon: "🧾" },
];

export default function AccountLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-brand-600 text-white rounded-2xl p-6 h-fit">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-3xl mb-2">
              👤
            </div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-brand-100">+91 {user?.phone}</p>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-white/20" : "hover:bg-white/10"
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-white/20 mt-4 pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 w-full text-left"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </aside>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
