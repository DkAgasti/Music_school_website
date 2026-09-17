import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { getProductBySlug } from "@/lib/api";
import BuyNowButton from "./BuyNowButton";

export default async function ProductDetailPage({ params }) {
  const product = await getProductBySlug(params.slug).catch(() => null);

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
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
        <p className="mt-4 text-gray-600">{product.description}</p>
        <p className="mt-6 text-xl font-semibold text-indigo-600">₹{product.price}</p>
        <BuyNowButton product={product} />
      </main>
      <Footer />
    </>
  );
}
