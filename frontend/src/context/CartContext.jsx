import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

const STORAGE_KEY = "k2c_cart";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // item: { productId, name, image, weight, price, qty, farmerName }
  const addToCart = (item) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.productId === item.productId && i.weight === item.weight
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].qty += item.qty;
        return copy;
      }
      return [...prev, item];
    });
  };

  const updateQty = (productId, weight, qty) => {
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId && i.weight === weight ? { ...i, qty } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const removeFromCart = (productId, weight) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.weight === weight)));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingFee = items.length > 0 ? 21.99 : 0;
  const total = subtotal + shippingFee;
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQty, removeFromCart, clearCart, subtotal, shippingFee, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};
