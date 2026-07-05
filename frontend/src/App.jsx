import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Addresses from "./pages/Addresses";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";

import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AgentDashboard from "./pages/agent/AgentDashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/checkout" element={<ProtectedRoute roles={["consumer"]}><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute roles={["consumer"]}><Orders /></ProtectedRoute>} />
          <Route path="/addresses" element={<ProtectedRoute roles={["consumer"]}><Addresses /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="/farmer" element={<ProtectedRoute roles={["farmer"]}><FarmerDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/agent" element={<ProtectedRoute roles={["agent"]}><AgentDashboard /></ProtectedRoute>} />

          <Route path="*" element={<div className="text-center py-24 text-gray-400">404 — Page not found</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
