import { cache } from "react";
import { apiGetProductBySlug } from "@/Api/public/shopApi";
import CheckoutClient from "./CheckoutClient";

// Metadata still needs a server-side fetch — it must be in the initial HTML
// for crawlers/link previews, which is the one thing a client component
// can't provide. The page body re-fetches client-side (see CheckoutClient).
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

export default function CheckoutPage({ params }) {
  return <CheckoutClient slug={params.slug} />;
}
