import Link from "next/link";

function getStockStatus(stock) {
  if (!stock || stock <= 0) return "Out of Stock";
  if (stock <= 2) return "Low Stock";
  return "In Stock";
}

function StockBadge({ status }) {
  if (status === "In Stock") {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-[#E8F8EE] px-2.5 py-0.5 text-[11px] font-medium text-[#16A34A]">
        In Stock
      </span>
    );
  }
  if (status === "Low Stock") {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-[#FEF3E2] px-2.5 py-0.5 text-[11px] font-medium text-[#D97706]">
        Low Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-[#FFE4E6] px-2.5 py-0.5 text-[11px] font-medium text-[#E11D48]">
      Out of Stock
    </span>
  );
}

export default function ProductCard({ product }) {
  const priceLabel = `₹${Math.round((product.price || 0) / 100).toLocaleString("en-IN")}`;
  const tagline = product.tagline || product.description;
  const stockStatus = getStockStatus(product.stock);
  const isOutOfStock = stockStatus === "Out of Stock";

  return (
    <div className="flex flex-col rounded-2xl border border-pink-100/70 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-5">
      {/* Image placeholder */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-tr from-[#D63E82] via-[#E66DA4] to-[#F298BE]">
        {product.imageUrls?.[0] && (
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        )}

        {/* Stock count chip */}
        <span className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[10px] font-bold leading-tight text-gray-800 shadow-sm">
          {isOutOfStock ? (
            "0 left"
          ) : (
            <>
              {product.stock}
              <br />
              left
            </>
          )}
        </span>
      </div>

      {/* Category + Stock */}
      <div className="mt-3 flex items-center justify-between gap-2">
        {product.category && (
          <span className="inline-flex items-center justify-center rounded-full bg-pink-50 px-2.5 py-0.5 text-[11px] font-medium text-brand-500">
            {product.category}
          </span>
        )}
        <StockBadge status={stockStatus} />
      </div>

      {/* Title */}
      <h3 className="mt-2.5 text-lg font-bold text-gray-900">{product.name}</h3>

      {/* Price */}
      <p className="mt-1 text-lg font-bold text-gray-900">{priceLabel}</p>

      {/* Tagline */}
      <p className="mt-1 text-sm text-gray-500">{tagline}</p>

      {/* Buy Now */}
      {isOutOfStock ? (
        <span className="mt-4 inline-flex cursor-not-allowed items-center justify-center rounded-full bg-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-500">
          Out of Stock
        </span>
      ) : (
        <Link
          href={`/shop/${product.slug}/checkout`}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-[#E11D48] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#D81B60] hover:shadow-md"
        >
          Buy Now
        </Link>
      )}
    </div>
  );
}
