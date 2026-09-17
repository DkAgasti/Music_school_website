"use client";

import DataTable from "@/components/admin/DataTable";
import { useAdminList } from "@/lib/useAdminList";

const COLUMNS = [
  { key: "name", label: "Student" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
];

export default function AdmissionsPage() {
  const { data: admissions, loading } = useAdminList("/admissions");

  const rows = admissions.map((a) => ({
    id: a.id,
    name: a.student.name,
    email: a.student.email,
    status: a.status,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Admissions</h1>
      <div className="mt-6">{loading ? <p className="text-sm text-gray-500">Loading...</p> : <DataTable columns={COLUMNS} rows={rows} />}</div>
    </div>
  );
}
