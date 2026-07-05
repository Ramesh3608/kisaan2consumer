// Converts a text address into { lat, lng } using the Google Maps Geocoding API.
// Requires GOOGLE_MAPS_API_KEY in .env. If it's not configured, this quietly
// returns null so the rest of the app (order creation, etc.) still works —
// admin will just fall back to manual (non-distance-sorted) agent assignment.

const geocodeAddress = async (addressParts) => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key || key.includes("xxxx")) {
    return null; // not configured
  }

  const fullAddress = [addressParts.street, addressParts.city, addressParts.state, addressParts.zip]
    .filter(Boolean)
    .join(", ");

  if (!fullAddress.trim()) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      fullAddress
    )}&key=${key}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "OK" && data.results?.length) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }

    console.warn("Geocoding failed:", data.status, data.error_message || "");
    return null;
  } catch (err) {
    console.warn("Geocoding request error:", err.message);
    return null;
  }
};

module.exports = { geocodeAddress };
