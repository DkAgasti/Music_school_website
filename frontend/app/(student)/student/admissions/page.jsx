"use client";

import { useEffect, useState } from "react";
import { apiGetMyProfile } from "@/Api/student/studentApi";
import Pagination from "@/components/student/Pagination";

const PAGE_SIZE = 8;

const STATUS_STYLES = {
  Approved: "bg-green-50 text-green-700",
  Completed: "bg-gray-100 text-gray-600",
  Pending: "bg-yellow-50 text-yellow-700",
  Rejected: "bg-red-50 text-red-700",
  Waitlisted: "bg-orange-50 text-orange-700",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  WAITLISTED: "Waitlisted",
  REJECTED: "Rejected",
};

export default function StudentAdmissionsPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await apiGetMyProfile();
      if (!cancelled && result) setProfile(result);
      if (!cancelled) setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (!profile) return <p className="text-sm text-gray-500">Failed to load your data.</p>;

  const admissions = profile.admissions.map((a) => ({
    id: a.id,
    class: a.class,
    appliedOn: a.appliedOn,
    batch: a.batch,
    status: STATUS_LABELS[a.status] || a.status,
  }));

  const totalPages = Math.max(1, Math.ceil(admissions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedAdmissions = admissions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-gray-900">Past Admissions</h1>
      <p className="mt-1 text-sm text-gray-500">Your admission applications and their status</p>

      <div className="mt-6 rounded-2xl border border-pink-100/70 bg-white p-4 sm:p-7">
        <h2 className="font-serif text-xl font-bold text-gray-900">Applications</h2>

        {paginatedAdmissions.length === 0 ? (
          <p className="mt-6 text-center text-sm text-gray-500">No admission applications yet.</p>
        ) : (
          <>
            {/* Mobile: stacked cards instead of a cramped, horizontally-scrolling table */}
            <div className="mt-4 space-y-2.5 sm:hidden">
              {paginatedAdmissions.map((admission) => (
                <div key={admission.id} className="rounded-xl border border-gray-100 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{admission.class}</p>
                      <p className="mt-0.5 text-xs text-gray-500 font-mono">{admission.id}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        STATUS_STYLES[admission.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {admission.status}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500">
                    <span>{admission.batch}</span>
                    <span>
                      {new Date(admission.appliedOn).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / tablet: table */}
            <div className="mt-4 hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="bg-gray-50 py-3 pl-4 pr-4 font-semibold first:rounded-l-lg">Admission ID</th>
                    <th className="bg-gray-50 py-3 pr-4 font-semibold">Class</th>
                    <th className="bg-gray-50 py-3 pr-4 font-semibold">Applied On</th>
                    <th className="bg-gray-50 py-3 pr-4 font-semibold">Batch</th>
                    <th className="bg-gray-50 py-3 pr-4 font-semibold last:rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedAdmissions.map((admission) => (
                    <tr key={admission.id}>
                      <td className="py-3 pl-4 pr-4 font-semibold text-gray-900">{admission.id}</td>
                      <td className="py-3 pr-4 text-gray-700">{admission.class}</td>
                      <td className="py-3 pr-4 text-gray-700">
                        {new Date(admission.appliedOn).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{admission.batch}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            STATUS_STYLES[admission.status] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {admission.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
