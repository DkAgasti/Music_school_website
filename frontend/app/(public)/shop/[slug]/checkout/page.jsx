import { cache } from "react";
import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { apiGetProductBySlug } from "@/Api/public/shopApi";
import CheckoutForm from "./CheckoutForm";

// generateMetadata and the page body both need this same product — this
// app's API client uses axios (not the native fetch Next.js auto-dedupes),
// so without this the same request would fire twice per page load.
const getProductBySlug = cache(apiGetProductBySlug);

export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return { title: "Product Not Found - Synchrocity Music School" };
  }

  const title = `Buy ${product.name} - Synchrocity Music School`;
  const description =
    product.description || `Buy ${product.name} from the Synchrocity Music School shop.`;

  return {
    title,
    description,
    openGraph: product.imageUrls?.[0]
      ? { title, description, images: [{ url: product.imageUrls[0] }] }
      : { title, description },
  };
}

export default async function CheckoutPage({ params }) {
  const product = await getProductBySlug(params.slug);

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
