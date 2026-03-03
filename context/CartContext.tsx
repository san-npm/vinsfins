"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Wine } from "@/data/wines";

export interface CartItem {
  wine: Wine;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (wine: Wine) => void;
  removeFromCart: (wineId: string) => void;
  updateQuantity: (wineId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const STORAGE_KEY = "vinsfins-cart";

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setItems(loadCartFromStorage());
    setHydrated(true);
  }, []);

  // Persist to localStorage on change (after initial hydration)
  useEffect(() => {
    if (hydrated) {
      saveCartToStorage(items);
    }
  }, [items, hydrated]);

  const addToCart = useCallback((wine: Wine) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.wine.id === wine.id);
      if (existing) {
        return prev.map((item) =>
          item.wine.id === wine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { wine, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((wineId: string) => {
    setItems((prev) => prev.filter((item) => item.wine.id !== wineId));
  }, []);

  const updateQuantity = useCallback((wineId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.wine.id !== wineId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.wine.id === wineId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.wine.priceShop * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
