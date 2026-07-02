"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/features/cart/CartContext";
import { formatCurrency } from "@/lib/utils";
import { apiFetch, ApiError } from "@/lib/api";
import { CartProvider } from "@/features/cart/CartContext";

interface OrderResponse {
  id: string;
  order_number: string;
  status: string;
  grand_total: number;
  shipping_address: any;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { cart, refreshCart } = useCart();
  
  const [couponCode, setCouponCode] = useState(searchParams.get("coupon_code") || "");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<OrderResponse | null>(null);

  // Address Form States
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentProvider, setPaymentProvider] = useState("stripe"); // stripe, sslcommerz, bkash

  const items = cart?.items || [];
  
  // Fetch discount if coupon was set in cart
  useEffect(() => {
    async function calculateDiscount() {
      if (!couponCode || items.length === 0) return;
      try {
        const res = await apiFetch<any>("/checkout/calculate", {
          method: "POST",
          body: JSON.stringify({
            coupon_code: couponCode,
            items: items.map(item => ({
              variant_id: item.variant_id,
              quantity: item.quantity
            }))
          })
        });
        setDiscountAmount(Number(res.discount_amount));
      } catch {
        setDiscountAmount(0);
      }
    }
    calculateDiscount();
  }, [couponCode, items]);

  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const tax = (subtotal - discountAmount) > 0 ? (subtotal - discountAmount) * 0.05 : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping + tax);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    setIsPlacingOrder(true);

    const shippingAddress = {
      first_name: firstName,
      last_name: lastName,
      address_line1: addressLine1,
      city: city,
      postal_code: postalCode,
      country: country,
      phone: phone,
      email: email,
    };

    try {
      const order = await apiFetch<OrderResponse>("/orders", {
        method: "POST",
        body: JSON.stringify({
          session_id: apiFetch.name, // Will fallback to guest session id handled inside api.ts
          coupon_code: couponCode || undefined,
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
          payment_provider: paymentProvider,
          payment_method: paymentProvider === "bkash" ? "mobile_banking" : "card",
        }),
      });

      setPlacedOrder(order);

      // Restore unselected items (saved in localStorage) back to the cart now that checkout completed!
      if (typeof window !== "undefined") {
        const savedStr = localStorage.getItem("saved_cart_items");
        if (savedStr) {
          localStorage.removeItem("saved_cart_items");
          try {
            const saved = JSON.parse(savedStr);
            if (Array.isArray(saved) && saved.length > 0) {
              for (const item of saved) {
                await apiFetch("/cart/items", {
                  method: "POST",
                  body: JSON.stringify({ variant_id: item.variant_id, quantity: item.quantity }),
                });
              }
            }
          } catch (e) {
            console.error("Failed to restore saved items after order placement:", e);
          }
        }
      }

      // Refresh the global cart state (cleared on server)
      await refreshCart();
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to place your order. Please check variant stock levels.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // 1. Success confirmation state
  if (placedOrder) {
    return (
      <div className="mx-auto max-w-2xl text-center py-16 flex flex-col gap-6 select-none bg-white p-8 border border-border mt-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl font-bold tracking-tight">Order Confirmed</h1>
          <p className="text-sm text-muted-foreground">
            Thank you for shopping at Atelier. We've received your order and are preparing shipment.
          </p>
        </div>
        
        <div className="border-y border-secondary py-6 my-2 text-xs flex flex-col gap-3 text-left font-semibold">
          <div className="flex justify-between">
            <span className="text-muted-foreground uppercase tracking-wider">Order Number</span>
            <span className="text-foreground">{placedOrder.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground uppercase tracking-wider">Payment Status</span>
            <span className="text-foreground">Pending Authorization</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground uppercase tracking-wider">Total Paid</span>
            <span className="text-foreground">{formatCurrency(placedOrder.grand_total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground uppercase tracking-wider">Delivery To</span>
            <span className="text-foreground capitalize">{placedOrder.shipping_address.city}, {placedOrder.shipping_address.country}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          A confirmation email has been sent to <strong>{placedOrder.shipping_address.email}</strong>.
        </p>

        <div className="flex gap-4 justify-center mt-4">
          <Link href="/products">
            <Button variant="outline" className="uppercase tracking-wider font-semibold text-xs px-6">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Standard empty state checks
  if (items.length === 0) {
    return (
      <div className="text-center py-20 select-none">
        <h2 className="font-serif text-xl font-bold mb-4">No items to checkout</h2>
        <p className="text-xs text-muted-foreground mb-6">Your shopping cart is currently empty.</p>
        <Link href="/products">
          <Button className="uppercase tracking-widest font-semibold text-xs px-8">
            Go to Shop
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handlePlaceOrder} className="py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Shipping details input fields column */}
      <div className="flex flex-col gap-6">
        <h2 className="font-serif text-2xl font-bold tracking-tight mb-2">Shipping Information</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Address Line 1"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <Input
            label="Postal Code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <hr className="border-secondary my-2" />

        {/* Payment Gateways selection */}
        <div className="flex flex-col gap-3 select-none">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Payment Method
          </span>
          <div className="grid grid-cols-3 gap-3">
            <div
              onClick={() => setPaymentProvider("stripe")}
              className={`flex flex-col items-center justify-center p-3 border rounded-sm cursor-pointer transition-colors ${
                paymentProvider === "stripe" ? "border-primary bg-secondary/35 font-bold" : "border-border hover:bg-secondary/20"
              }`}
            >
              <span className="text-xs tracking-wider">Credit Card</span>
            </div>
            <div
              onClick={() => setPaymentProvider("bkash")}
              className={`flex flex-col items-center justify-center p-3 border rounded-sm cursor-pointer transition-colors ${
                paymentProvider === "bkash" ? "border-primary bg-secondary/35 font-bold" : "border-border hover:bg-secondary/20"
              }`}
            >
              <span className="text-xs tracking-wider">bKash / MFS</span>
            </div>
            <div
              onClick={() => setPaymentProvider("sslcommerz")}
              className={`flex flex-col items-center justify-center p-3 border rounded-sm cursor-pointer transition-colors ${
                paymentProvider === "sslcommerz" ? "border-primary bg-secondary/35 font-bold" : "border-border hover:bg-secondary/20"
              }`}
            >
              <span className="text-xs tracking-wider">SSLCommerz</span>
            </div>
          </div>
        </div>

      </div>

      {/* Review preview totals order column */}
      <div className="flex flex-col gap-6 bg-secondary/10 border border-border p-6 h-fit select-none">
        <h2 className="font-serif text-lg font-bold tracking-tight border-b border-secondary pb-3">
          Your Order Details
        </h2>

        {/* Items quick list */}
        <div className="flex flex-col gap-4 max-h-48 overflow-y-auto scrollbar-thin">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground line-clamp-1">{item.name} x {item.quantity}</span>
              <span className="font-bold">{formatCurrency(Number(item.price) * item.quantity)}</span>
            </div>
          ))}
        </div>

        <hr className="border-secondary" />

        <div className="flex flex-col gap-3 text-xs font-medium text-foreground/90">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount Applied</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
          </div>

          <div className="flex justify-between">
            <span>Taxes (5% VAT)</span>
            <span>{formatCurrency(tax)}</span>
          </div>

          <hr className="border-secondary my-1" />

          <div className="flex justify-between text-sm font-bold text-foreground">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {checkoutError && (
          <p className="text-xs text-red-500 font-semibold mt-2" role="alert">
            {checkoutError}
          </p>
        )}

        <Button
          type="submit"
          isLoading={isPlacingOrder}
          className="w-full uppercase tracking-widest font-semibold mt-4 text-xs h-12"
        >
          Confirm and Place Order
        </Button>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div className="text-center py-20 uppercase text-xs tracking-widest animate-pulse">Loading Checkout Details...</div>}>
            <CheckoutContent />
          </Suspense>
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
