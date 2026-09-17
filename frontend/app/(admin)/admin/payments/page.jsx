"use client";

import DataTable from "@/components/admin/DataTable";
import { useAdminList } from "@/lib/useAdminList";

const COLUMNS = [
  { key: "razorpayOrderId", label: "Order ID" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
];

export default function PaymentsPage() {
  const { data: payments, loading } = useAdminList("/payments");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
      <div className="mt-6">{loading ? <p className="text-sm text-gray-500">Loading...</p> : <DataTable columns={COLUMNS} rows={payments} />}</div>
    </div>
  );
}
