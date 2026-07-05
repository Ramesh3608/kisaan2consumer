import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-white font-bold text-lg mb-2">🌱 FarmFresh</h4>
          <p className="text-sm text-gray-400">Connecting farmers and consumers directly for fresher, better produce.</p>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-2">Quick Links</h5>
          <ul className="text-sm space-y-1 text-gray-400">
            <li>About Us</li>
            <li>Shop Products</li>
            <li>Our Farmers</li>
            <li>Blog & News</li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-2">Customer Service</h5>
          <ul className="text-sm space-y-1 text-gray-400">
            <li>Help Center</li>
            <li>Shipping Info</li>
            <li>Returns Policy</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-2">Contact Us</h5>
          <ul className="text-sm space-y-1 text-gray-400">
            <li>📍 Kattankulathur, Tamil Nadu</li>
            <li>📞 +91 90596 85340</li>
            <li>✉️ contact@farmfresh.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center text-xs text-gray-500 py-4">
        © 2026 FarmFresh (Kisaan2Consumer). All rights reserved.
      </div>
    </footer>
  );
}
