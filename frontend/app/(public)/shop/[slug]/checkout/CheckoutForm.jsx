"use client";

import { useState } from "react";
import Script from "next/script";
import { api } from "@/lib/api";

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-800">{label}</span>
      <input
        className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20"
        {...props}
      />
    </label>
  );
}

export default function CheckoutForm({ product }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    deliveryAddress: "",
    city: "",
    pinCode: "",
    sameAsDelivery: true,
  });
  const [status, setStatus] = useState("idle");

  const priceLabel = Math.round((product.price || 0) / 100).toLocaleString("en-IN");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const { razorpayOrder } = await api.post("/shop/orders", {
        productId: product.id,
        name: form.fullName,
        email: form.email,
        phone: form.phone,
      });

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: product.name,
        prefill: { name: form.fullName, email: form.email, contact: form.phone },
        handler: () => setStatus("success"),
      });
      rzp.open();
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <form onSubmit={handleSubmit} className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Billing & Delivery Details */}
        <div className="rounded-2xl border border-pink-100/70 bg-white p-6 sm:p-7">
          <h2 className="font-serif text-xl font-bold text-gray-900">
            Billing &amp; Delivery Details
          </h2>

          <div className="mt-5 space-y-4">
            <Field
              label="Full Name *"
              required
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Email Address *"
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
              <Field
                label="Phone Number *"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>

            <Field
              label="Delivery Address *"
              required
              value={form.deliveryAddress}
              onChange={(e) => update("deliveryAddress", e.target.value)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="City *"
                required
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
              <Field
                label="PIN Code *"
                required
                value={form.pinCode}
                onChange={(e) => update("pinCode", e.target.value)}
              />
            </div>

            <label className="flex items-center gap-2.5 pt-1 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={form.sameAsDelivery}
                onChange={(e) => update("sameAsDelivery", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#E11D48] focus:ring-[#E11D48]/30"
              />
              Billing address same as delivery address
            </label>

            <p className="pt-1 text-xs text-gray-400">
              Delivery within 5-7 working days across India.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-2xl border border-pink-100/70 bg-white p-6 sm:p-7">
          <h2 className="font-serif text-xl font-bold text-gray-900">Order Summary</h2>

          <div className="mt-5 flex items-start gap-3.5">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-tr from-[#D63E82] via-[#E66DA4] to-[#F298BE]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900">{product.name}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Qty: 1 &middot; {product.tagline || product.description}
              </p>
              <p className="mt-1 text-sm font-bold text-gray-900">₹{priceLabel}</p>
            </div>
          </div>

          <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-5 text-sm">
            <div className="flex items-center justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="text-gray-900">₹{priceLabel}</span>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span>Delivery</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-lg font-bold text-[#E11D48]">₹{priceLabel}</span>
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="mt-5 w-full rounded-full bg-[#E11D48] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#D81B60] hover:shadow-md disabled:opacity-60"
          >
            {status === "submitting" ? "Processing..." : `Pay ₹${priceLabel} Securely`}
          </button>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-xs">
            <span className="flex items-center gap-1.5 text-gray-600">
              <svg className="h-4 w-4 shrink-0 text-[#3395FF]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 3h16l-6.5 18h-3L14 12H8l-1.5 4h-3z" />
              </svg>
              Powered by <span className="font-bold text-gray-900">Razorpay</span>
            </span>
            <span className="flex items-center gap-1 font-medium text-green-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
              </svg>
              100% Secure
            </span>
          </div>

          <p className="mt-3 text-center text-[11px] text-gray-400">
            UPI &middot; Cards &middot; Netbanking &middot; Wallets
          </p>

          {status === "success" && (
            <p className="mt-3 text-center text-sm font-medium text-green-600">
              Order placed successfully!
            </p>
          )}
          {status === "error" && (
            <p className="mt-3 text-center text-sm font-medium text-red-600">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </form>
    </>
  );
}
