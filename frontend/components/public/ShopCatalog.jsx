"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { apiGetProducts } from "@/Api/public/shopApi";

const PAGE_SIZE = 12;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "instruments", label: "Instruments" },
  { key: "books", label: "Books" },
];

export default function ShopCatalog() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    apiGetProducts({ active: true, page: 1, limit: PAGE_SIZE }).then((res) => {
      if (!res) return;
      setProducts(res.items || []);
      setTotalPages(res.totalPages || 1);
    });
  }, []);

  async function handleFilterChange(filterKey) {
    setActiveFilter(filterKey);
    setLoadingMore(true);
    const res = await apiGetProducts({
      active: true,
      page: 1,
      limit: PAGE_SIZE,
      ...(filterKey !== "all" ? { category: filterKey } : {}),
    });
    if (res) {
      setProducts(res.items || []);
      setPage(1);
      setTotalPages(res.totalPages || 1);
    }
    setLoadingMore(false);
  }

  async function handleLoadMore() {
    setLoadingMore(true);
    const nextPage = page + 1;
    const res = await apiGetProducts({
      active: true,
      page: nextPage,
      limit: PAGE_SIZE,
      ...(activeFilter !== "all" ? { category: activeFilter } : {}),
    });
    if (res) {
      setProducts((prev) => [...prev, ...(res.items || [])]);
      setPage(nextPage);
      setTotalPages(res.totalPages || 1);
    }
    setLoadingMore(false);
  }

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-3">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => handleFilterChange(filter.key)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#E11D48] text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Grid: products + Direct Purchase card, 4 per row, all matching height */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.length === 0 && (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-pink-200 bg-white/60 text-sm text-gray-500">
            No products in this category yet.
          </div>
        )}

        {products.slice(0, 3).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {/* Direct Purchase card — sits in the 4th slot of the first row */}
        <div className="flex flex-col rounded-2xl border border-pink-100/70 bg-white p-5 sm:p-6">
          <h3 className="text-lg font-bold text-[#E11D48]">Direct Purchase</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Click on &lsquo;Buy Now&rsquo; to purchase your selected product. No cart required.
          </p>

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3">
            <svg className="h-5 w-5 shrink-0 text-[#3395FF]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 3h16l-6.5 18h-3L14 12H8l-1.5 4h-3z" />
            </svg>
            <span className="text-sm font-bold text-gray-900">Razorpay</span>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3">
            <svg className="h-5 w-5 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
            </svg>
            <span className="text-sm font-bold text-gray-900">Secure Payment</span>
          </div>
        </div>

        {/* Remaining products continue the 4-per-row grid */}
        {products.slice(3).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {page < totalPages && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? "Loading…" : "Load More Products"}
          </button>
        </div>
      )}
    </div>
  );
}
