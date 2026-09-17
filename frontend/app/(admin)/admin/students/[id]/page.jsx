"use client";

import { useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import { useAdminList } from "@/lib/useAdminList";

export default function StudentProfilePage() {
  const { id } = useParams();
  const { data: student, loading } = useAdminList(`/students/${id}`);

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (!student?.id) return <p className="text-sm text-gray-500">Student not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
      <p className="text-sm text-gray-500">{student.email} · {student.phone}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="font-semibold text-gray-900">Attendance</h2>
          <p className="mt-1 text-sm text-gray-500">{student.attendance?.length ?? 0} records</p>
        </Card>
        <Card>
          <h2 className="font-semibold text-gray-900">Progress</h2>
          <p className="mt-1 text-sm text-gray-500">{student.progress?.length ?? 0} notes</p>
        </Card>
        <Card>
          <h2 className="font-semibold text-gray-900">Payments</h2>
          <p className="mt-1 text-sm text-gray-500">{student.payments?.length ?? 0} payments</p>
        </Card>
      </div>
    </div>
  );
}
