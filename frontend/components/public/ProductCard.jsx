import Link from "next/link";

export default function ProductCard({ product }) {
  const priceLabel = `₹${Math.round((product.price || 0) / 100).toLocaleString("en-IN")}`;
  const tagline = product.tagline || product.description;

  return (
    <div className="flex flex-col rounded-2xl border border-pink-100/70 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-5">
      {/* Image placeholder */}
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-tr from-[#D63E82] via-[#E66DA4] to-[#F298BE]">
        {product.imageUrls?.[0] && (
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Title */}
      <h3 className="mt-4 text-lg font-bold text-gray-900">{product.name}</h3>

      {/* Price */}
      <p className="mt-1 text-lg font-bold text-gray-900">{priceLabel}</p>

      {/* Tagline */}
      <p className="mt-1 text-sm text-gray-500">{tagline}</p>

      {/* Buy Now */}
      <Link
        href={`/shop/${product.slug}/checkout`}
        className="mt-4 inline-flex items-center justify-center rounded-full bg-[#E11D48] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#D81B60] hover:shadow-md"
      >
        Buy Now
      </Link>
    </div>
  );
}
