"use client";

import Link from "next/link";
import { useAdminList } from "@/lib/useAdminList";

export default function StudentsPage() {
  const { data: students, loading } = useAdminList("/students");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Students</h1>
      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <p className="p-4 text-sm text-gray-500">Loading...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Batch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-2">
                    <Link href={`/admin/students/${student.id}`} className="text-indigo-600 hover:underline">
                      {student.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-gray-800">{student.email}</td>
                  <td className="px-4 py-2 text-gray-800">{student.batch?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
