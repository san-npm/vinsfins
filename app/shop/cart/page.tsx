"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  return (
    <div className="pt-20">
      <section className="section-padding">
        <div className="container-custom mx-auto max-w-4xl">
          <h1 className="font-playfair text-3xl sm:text-4xl mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-charcoal/50 text-lg mb-6">Your cart is empty</p>
              <Link href="/shop" className="btn-primary">Continue Shopping</Link>
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-8">
                {items.map((item) => (
                  <div key={item.wine.id} className="flex gap-6 bg-white p-6 rounded-sm">
                    <div className="w-20 h-28 flex-shrink-0 overflow-hidden rounded">
                      <img src={item.wine.image} alt={item.wine.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-playfair text-lg">{item.wine.name}</h3>
                      <p className="text-sm text-charcoal/50">{item.wine.vintage} · {item.wine.region}</p>
                      <p className="text-burgundy font-bold mt-2">€{item.wine.priceShop}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeFromCart(item.wine.id)} className="text-charcoal/40 hover:text-red-500 text-sm">
                        Remove
                      </button>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.wine.id, item.quantity - 1)}
                          className="w-8 h-8 rounded border border-charcoal/20 flex items-center justify-center hover:bg-burgundy hover:text-cream hover:border-burgundy transition-colors"
                        >
                          −
                        </button>
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.wine.id, item.quantity + 1)}
                          className="w-8 h-8 rounded border border-charcoal/20 flex items-center justify-center hover:bg-burgundy hover:text-cream hover:border-burgundy transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold">€{(item.wine.priceShop * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-8 rounded-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-charcoal/60">Subtotal</span>
                  <span className="font-semibold">€{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-charcoal/60">Shipping</span>
                  <span className="text-sm text-charcoal/50">{totalPrice >= 100 ? "Free" : "€9.90"}</span>
                </div>
                <div className="border-t border-charcoal/10 my-4" />
                <div className="flex justify-between items-center mb-6">
                  <span className="font-playfair text-xl">Total</span>
                  <span className="font-playfair text-2xl font-bold text-burgundy">
                    €{(totalPrice + (totalPrice >= 100 ? 0 : 9.9)).toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/shop/checkout" className="btn-primary text-center flex-1">
                    Proceed to Checkout
                  </Link>
                  <button onClick={clearCart} className="btn-outline text-center">
                    Clear Cart
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
