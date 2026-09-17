"use client";

import { useState } from "react";
import Script from "next/script";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function BuyNowButton({ product }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState("idle");

  async function handleBuy() {
    setStatus("submitting");
    try {
      const { razorpayOrder } = await api.post("/shop/orders", { productId: product.id, ...form });

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: product.title,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        handler: () => setStatus("success"),
      });
      rzp.open();
    } catch {
      setStatus("error");
    }
  }

  if (!open) {
    return (
      <Button className="mt-6" onClick={() => setOpen(true)}>
        Buy Now
      </Button>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="mt-6 max-w-sm space-y-3">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Button onClick={handleBuy} disabled={status === "submitting"}>
          {status === "submitting" ? "Processing..." : "Proceed to Pay"}
        </Button>
        {status === "success" && <p className="text-sm text-green-600">Order placed!</p>}
        {status === "error" && <p className="text-sm text-red-600">Something went wrong.</p>}
      </div>
    </>
  );
}
