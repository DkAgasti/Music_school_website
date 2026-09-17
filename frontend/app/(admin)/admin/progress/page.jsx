"use client";

import DataTable from "@/components/admin/DataTable";
import { useAdminList } from "@/lib/useAdminList";

const COLUMNS = [
  { key: "studentId", label: "Student ID" },
  { key: "note", label: "Note" },
];

export default function ProgressPage() {
  const { data: progress, loading } = useAdminList("/progress");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Progress Notes</h1>
      <div className="mt-6">{loading ? <p className="text-sm text-gray-500">Loading...</p> : <DataTable columns={COLUMNS} rows={progress} />}</div>
    </div>
  );
}
