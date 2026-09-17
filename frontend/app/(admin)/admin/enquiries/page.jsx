"use client";

import DataTable from "@/components/admin/DataTable";
import { useAdminList } from "@/lib/useAdminList";

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "message", label: "Message" },
];

export default function EnquiriesPage() {
  const { data: enquiries, loading } = useAdminList("/enquiries");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
      <div className="mt-6">{loading ? <p className="text-sm text-gray-500">Loading...</p> : <DataTable columns={COLUMNS} rows={enquiries} />}</div>
    </div>
  );
}
