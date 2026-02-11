"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<"form" | "confirmed">("form");
  const shipping = totalPrice >= 100 ? 0 : 9.9;
  const total = totalPrice + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("confirmed");
    clearCart();
  };

  if (step === "confirmed") {
    return (
      <div className="pt-24 sm:pt-20 section-padding">
        <div className="container-custom mx-auto max-w-2xl text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="font-playfair text-2xl sm:text-3xl lg:text-4xl mb-4">Order Confirmed!</h1>
          <p className="text-charcoal/70 mb-2">Thank you for your order.</p>
          <p className="text-charcoal/50 text-sm mb-8">
            This is a mockup — no actual order has been placed. In the real version, you&apos;d receive a confirmation email.
          </p>
          <Link href="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-24 sm:pt-20 section-padding text-center">
        <p className="text-charcoal/50 text-lg mb-6">Your cart is empty</p>
        <Link href="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const inputClasses = "w-full border border-charcoal/10 rounded-sm px-4 py-3 text-sm bg-cream/50 font-light text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-burgundy/60 focus:ring-1 focus:ring-burgundy/20 transition-all duration-300 min-h-[44px]";

  return (
    <div className="pt-24 sm:pt-20">
      <section className="section-padding">
        <div className="container-custom mx-auto max-w-5xl">
          <h1 className="font-playfair text-2xl sm:text-3xl lg:text-4xl mb-6 sm:mb-8 pt-2 sm:pt-0">Checkout</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Order Summary — first on mobile */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <div className="bg-white p-5 sm:p-6 rounded-sm lg:sticky lg:top-24">
                <h2 className="font-playfair text-xl mb-4">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.wine.id} className="flex gap-3">
                      <div className="w-12 h-16 bg-burgundy/5 rounded overflow-hidden flex-shrink-0">
                        <img src={item.wine.image} alt={item.wine.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.wine.name}</p>
                        <p className="text-xs text-charcoal/50">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold">€{(item.wine.priceShop * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-charcoal/10 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Subtotal</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Shipping</span>
                    <span>{shipping === 0 ? "Free" : `€${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t border-charcoal/10 pt-3 mt-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-playfair text-lg">Total</span>
                      <span className="font-playfair text-xl font-bold text-burgundy">€{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Contact */}
              <div className="bg-white p-5 sm:p-6 rounded-sm">
                <h2 className="font-playfair text-xl mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required placeholder="First Name" className={inputClasses} />
                  <input required placeholder="Last Name" className={inputClasses} />
                  <input required type="email" placeholder="Email" className={`sm:col-span-2 ${inputClasses}`} />
                  <input required type="tel" placeholder="Phone" className={`sm:col-span-2 ${inputClasses}`} />
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white p-5 sm:p-6 rounded-sm">
                <h2 className="font-playfair text-xl mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required placeholder="Street Address" className={`sm:col-span-2 ${inputClasses}`} />
                  <input placeholder="Apartment, suite, etc." className={`sm:col-span-2 ${inputClasses}`} />
                  <input required placeholder="City" className={inputClasses} />
                  <input required placeholder="Postal Code" className={inputClasses} />
                  <select required className={`sm:col-span-2 ${inputClasses}`}>
                    <option value="LU">Luxembourg</option>
                    <option value="BE">Belgium</option>
                    <option value="FR">France</option>
                    <option value="DE">Germany</option>
                  </select>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white p-5 sm:p-6 rounded-sm">
                <h2 className="font-playfair text-xl mb-4">Payment</h2>
                <div className="grid grid-cols-1 gap-4">
                  <input required placeholder="Card Number" className={inputClasses} />
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="MM / YY" className={inputClasses} />
                    <input required placeholder="CVC" className={inputClasses} />
                  </div>
                </div>
                <p className="text-xs text-charcoal/40 mt-4">🔒 This is a mockup. No real payment will be processed.</p>
              </div>

              <div className="flex items-start gap-3">
                <input type="checkbox" required id="age" className="mt-1 min-w-[20px] min-h-[20px]" />
                <label htmlFor="age" className="text-sm text-charcoal/70">
                  I confirm that I am at least 18 years of age and agree to the Terms & Conditions.
                </label>
              </div>

              <button type="submit" className="btn-primary w-full text-center text-base sm:text-lg py-4">
                Place Order — €{total.toFixed(2)}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
