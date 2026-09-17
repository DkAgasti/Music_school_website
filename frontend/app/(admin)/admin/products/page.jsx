"use client";

import DataTable from "@/components/admin/DataTable";
import { useAdminList } from "@/lib/useAdminList";

const COLUMNS = [
  { key: "title", label: "Title" },
  { key: "price", label: "Price" },
];

export default function ProductsAdminPage() {
  const { data: products, loading } = useAdminList("/shop/products");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Products</h1>
      <div className="mt-6">{loading ? <p className="text-sm text-gray-500">Loading...</p> : <DataTable columns={COLUMNS} rows={products} />}</div>
    </div>
  );
}
