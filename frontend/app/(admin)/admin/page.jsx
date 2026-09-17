"use client";

import StatCard from "@/components/admin/StatCard";
import { useAdminList } from "@/lib/useAdminList";

export default function AdminDashboardPage() {
  const { data: admissions } = useAdminList("/admissions");
  const { data: students } = useAdminList("/students");
  const { data: enquiries } = useAdminList("/enquiries");
  const { data: payments } = useAdminList("/payments");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Admissions" value={admissions.length} />
        <StatCard label="Students" value={students.length} />
        <StatCard label="Enquiries" value={enquiries.length} />
        <StatCard label="Payments" value={payments.length} />
      </div>
    </div>
  );
}
