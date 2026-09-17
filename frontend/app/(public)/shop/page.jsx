import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import Card from "@/components/ui/Card";
import { getProducts } from "@/lib/api";

export default async function ShopPage() {
  const products = await getProducts().catch(() => []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} href={`/shop/${product.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{product.description}</p>
                <p className="mt-3 text-sm font-medium text-indigo-600">₹{product.price}</p>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
