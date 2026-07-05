import React from "react";

// Maps product image keys / categories to an emoji so the app looks good
// without needing real uploaded photos. Farmers can still set a custom
// `image` key when adding a product (see AddProduct.jsx for the picker).
const ICON_MAP = {
  grapes: "🍇",
  black_grapes: "🍇",
  almonds: "🌰",
  onions: "🧅",
  marigold: "🌼",
  brinjal: "🍆",
  carrots: "🥕",
  apples: "🍎",
  tomatoes: "🍅",
  wheat: "🌾",
  mango: "🥭",
  banana: "🍌",
  potato: "🥔",
  spinach: "🥬",
  chili: "🌶️",
  milk: "🥛",
  honey: "🍯",
  corn: "🌽",
};

const CATEGORY_FALLBACK = {
  fruit: "🍓",
  vegetable: "🥦",
  seeds: "🌱",
  flowers: "💐",
  nuts: "🥜",
  dairy: "🧀",
  beverages: "🧃",
  snacks: "🍪",
};

export default function ProductIcon({ image, category, className = "icon-emoji" }) {
  // Real uploaded photo (base64 data URL) or an external image URL
  const [failed, setFailed] = React.useState(false);
  const isRealImage = image && (image.startsWith("data:image") || image.startsWith("http"));

  if (isRealImage && !failed) {
    return (
      <img
        src={image}
        alt=""
        className="w-full h-full object-cover rounded-xl"
        onError={() => setFailed(true)}
      />
    );
  }

  const emoji = ICON_MAP[image] || CATEGORY_FALLBACK[category] || "🌿";
  return <span className={className}>{emoji}</span>;
}

export { ICON_MAP, CATEGORY_FALLBACK };
