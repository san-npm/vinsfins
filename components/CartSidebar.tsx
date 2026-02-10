"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartSidebar() {
  const { items, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setIsCartOpen(false)} />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-cream z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-burgundy/10">
          <h2 className="font-playfair text-xl text-burgundy">Your Cart</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-charcoal/60 hover:text-charcoal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12 text-charcoal/50">
              <svg className="w-16 h-16 mx-auto mb-4 text-burgundy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="font-playfair text-lg">Your cart is empty</p>
              <p className="text-sm mt-2">Browse our shop to find the perfect wine</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.wine.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-burgundy/5 rounded overflow-hidden flex-shrink-0">
                    <img src={item.wine.image} alt={item.wine.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-playfair text-sm font-semibold text-charcoal truncate">{item.wine.name}</h4>
                    <p className="text-xs text-charcoal/60">{item.wine.vintage} · {item.wine.region}</p>
                    <p className="text-sm font-semibold text-burgundy mt-1">€{item.wine.priceShop}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.wine.id, item.quantity - 1)}
                        className="w-6 h-6 rounded border border-charcoal/20 flex items-center justify-center text-xs hover:bg-burgundy hover:text-cream hover:border-burgundy transition-colors"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.wine.id, item.quantity + 1)}
                        className="w-6 h-6 rounded border border-charcoal/20 flex items-center justify-center text-xs hover:bg-burgundy hover:text-cream hover:border-burgundy transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.wine.id)}
                        className="ml-auto text-charcoal/40 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-burgundy/10 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-playfair text-lg">Total</span>
              <span className="font-playfair text-xl font-bold text-burgundy">€{totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-xs text-charcoal/50">Shipping calculated at checkout</p>
            <Link
              href="/shop/checkout"
              onClick={() => setIsCartOpen(false)}
              className="btn-primary block text-center w-full"
            >
              Checkout
            </Link>
            <Link
              href="/shop/cart"
              onClick={() => setIsCartOpen(false)}
              className="btn-outline block text-center w-full"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
