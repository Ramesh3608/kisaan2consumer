import React from "react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">About Kisaan2Consumer</h1>
      <p className="text-gray-600 leading-relaxed mb-4">
        Kisaan2Consumer (K2C) is a direct farm-to-consumer marketplace built to close the gap
        between Indian farmers and everyday consumers. Farmers often receive only a fraction of
        the final retail price because of layers of middlemen — K2C removes those layers so
        farmers earn fairly and consumers get fresher produce at better prices.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        Farmers can list their produce with transparent pricing, consumers can browse and order
        directly, delivery agents handle last-mile logistics, and admins keep the whole
        marketplace healthy and trustworthy.
      </p>
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        {[
          { icon: "🌾", title: "For Farmers", desc: "List produce, manage orders, and get paid fairly — no middlemen." },
          { icon: "🛍️", title: "For Consumers", desc: "Fresh, local, transparently priced produce delivered to your door." },
          { icon: "🚚", title: "For Agents", desc: "Efficient delivery assignments and simple status tracking." },
        ].map((c) => (
          <div key={c.title} className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="text-4xl mb-3">{c.icon}</div>
            <h3 className="font-semibold mb-1">{c.title}</h3>
            <p className="text-sm text-gray-500">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
