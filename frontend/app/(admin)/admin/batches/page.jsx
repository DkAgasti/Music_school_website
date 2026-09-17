"use client";

import DataTable from "@/components/admin/DataTable";
import { useAdminList } from "@/lib/useAdminList";

const COLUMNS = [
  { key: "name", label: "Batch" },
  { key: "schedule", label: "Schedule" },
  { key: "capacity", label: "Capacity" },
];

export default function BatchesPage() {
  const { data: batches, loading } = useAdminList("/classes/batches/all");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
      <div className="mt-6">{loading ? <p className="text-sm text-gray-500">Loading...</p> : <DataTable columns={COLUMNS} rows={batches} />}</div>
    </div>
  );
}
