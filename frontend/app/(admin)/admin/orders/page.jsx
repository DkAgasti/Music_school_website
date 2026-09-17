"use client";

import DataTable from "@/components/admin/DataTable";
import { useAdminList } from "@/lib/useAdminList";

const COLUMNS = [
  { key: "name", label: "Customer" },
  { key: "email", label: "Email" },
  { key: "product", label: "Product" },
];

export default function OrdersPage() {
  const { data: orders, loading } = useAdminList("/shop/orders");

  const rows = orders.map((o) => ({ ...o, product: o.product?.title }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <div className="mt-6">{loading ? <p className="text-sm text-gray-500">Loading...</p> : <DataTable columns={COLUMNS} rows={rows} />}</div>
    </div>
  );
}
