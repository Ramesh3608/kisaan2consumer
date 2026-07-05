import React, { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      {sent ? (
        <p className="bg-green-50 text-green-700 rounded-xl p-4">Thanks! We'll get back to you soon.</p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <input required placeholder="Your Name" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <input required type="email" placeholder="Your Email" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <textarea required rows={4} placeholder="Message" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <button className="bg-brand-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-600">Send Message</button>
        </form>
      )}
      <div className="mt-8 text-sm text-gray-500 space-y-1">
        <p>📍 SRM Institute of Science and Technology, Kattankulathur</p>
        <p>📞 +91 90596 85340</p>
        <p>✉️ contact@farmfresh.com</p>
      </div>
    </div>
  );
}
