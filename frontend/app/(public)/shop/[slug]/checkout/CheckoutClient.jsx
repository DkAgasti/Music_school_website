"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { apiGetProductBySlug } from "@/Api/public/shopApi";
import CheckoutForm from "./CheckoutForm";

export default function CheckoutClient({ slug }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGetProductBySlug(slug).then((res) => {
      if (cancelled) return;
      setProduct(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return null;

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-16">
          <p className="text-gray-600">Product not found.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FFF7F9]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-400">
            <Link href="/shop" className="hover:text-gray-600">
              Shop
            </Link>
            <span>&rsaquo;</span>
            <span className="font-semibold text-[#E11D48]">Checkout</span>
          </nav>

          {/* Heading */}
          <h1 className="mt-4 font-serif text-4xl font-bold text-gray-900 sm:text-[42px]">
            Checkout
          </h1>

          <CheckoutForm product={product} />
        </div>
      </main>

      <Footer />
    </>
  );
}
