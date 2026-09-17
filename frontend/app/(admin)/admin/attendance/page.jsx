"use client";

import DataTable from "@/components/admin/DataTable";
import { useAdminList } from "@/lib/useAdminList";

const COLUMNS = [
  { key: "studentId", label: "Student ID" },
  { key: "date", label: "Date" },
  { key: "present", label: "Present" },
];

export default function AttendancePage() {
  const { data: attendance, loading } = useAdminList("/attendance");

  const rows = attendance.map((a) => ({ ...a, present: a.present ? "Yes" : "No" }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
      <div className="mt-6">{loading ? <p className="text-sm text-gray-500">Loading...</p> : <DataTable columns={COLUMNS} rows={rows} />}</div>
    </div>
  );
}
