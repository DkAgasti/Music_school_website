"use client";

import { useState } from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { submitEnquiry } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitEnquiry(form);
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Get in Touch</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Message</span>
              <textarea
                required
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </label>
            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending..." : "Send Message"}
            </Button>
            {status === "success" && <p className="text-sm text-green-600">Thanks! We&apos;ll be in touch.</p>}
            {status === "error" && <p className="text-sm text-red-600">Something went wrong. Try again.</p>}
          </form>
        </div>
        <div className="h-80 w-full overflow-hidden rounded-lg border border-gray-200 md:h-full">
          <iframe
            title="Location"
            src="https://maps.google.com/maps?q=music%20school&t=&z=13&ie=UTF8&iwloc=&output=embed"
            className="h-full w-full"
            loading="lazy"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
