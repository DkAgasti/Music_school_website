"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGetMyProfile } from "@/Api/student/studentApi";
import Pagination from "@/components/student/Pagination";

const PAGE_SIZE = 8;
const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "PRESENT", label: "Present" },
  { value: "LATE", label: "Late" },
  { value: "ABSENT", label: "Absent" },
];

function StatCard({ label, value, valueClassName = "text-gray-900" }) {
  return (
    <div className="rounded-xl border border-pink-100/70 bg-white p-3.5 sm:p-5">
      <p className="text-xs text-gray-500 sm:text-sm">{label}</p>
      <p className={`mt-1.5 text-lg font-bold sm:mt-2 sm:text-2xl ${valueClassName}`}>{value}</p>
    </div>
  );
}

export default function StudentAttendancePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
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

  const allSessions = useMemo(() => {
    if (!profile) return [];
    return profile.attendanceReport.allRecords.map((r) => ({
      id: r.id,
      date: r.date,
      dateLabel: new Date(r.date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      class: r.className,
      time: r.schedule,
      status: r.status,
      statusLabel: r.status === "PRESENT" ? "Present" : r.status === "LATE" ? "Late" : "Absent",
    }));
  }, [profile]);

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allSessions.filter((session) => {
      const matchesStatus = statusFilter === "ALL" || session.status === statusFilter;
      const matchesClass = classFilter === "ALL" || session.class === classFilter;
      const matchesSearch =
        !query ||
        session.class?.toLowerCase().includes(query) ||
        session.dateLabel.toLowerCase().includes(query);
      return matchesStatus && matchesClass && matchesSearch;
    });
  }, [allSessions, search, statusFilter, classFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function updateSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function updateStatusFilter(value) {
    setStatusFilter(value);
    setPage(1);
  }

  function updateClassFilter(value) {
    setClassFilter(value);
    setPage(1);
  }

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (!profile) return <p className="text-sm text-gray-500">Failed to load your data.</p>;

  const { attendanceReport } = profile;
  const classOptions = profile.enrolledClasses.map((c) => c.name);
  const overall = attendanceReport.attendancePercentage;
  const sessionsPresent = attendanceReport.presentClasses;
  const sessionsAbsent = attendanceReport.absentClasses;

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-gray-900">Attendance</h1>
      <p className="mt-1 text-sm text-gray-500">Your attendance record for this term</p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-4">
        <StatCard label="Overall Attendance" value={overall} />
        <StatCard label="Sessions Present" value={sessionsPresent} valueClassName="text-green-600" />
        <StatCard label="Sessions Absent" value={sessionsAbsent} valueClassName="text-red-600" />
      </div>

      {/* Sessions */}
      <div className="mt-6 rounded-2xl border border-pink-100/70 bg-white p-4 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-xl font-bold text-gray-900">Attendance History</h2>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder="Search by class or date..."
              className="rounded-lg border border-gray-200 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 sm:w-56"
            />
            <div className="flex gap-2.5">
              {classOptions.length > 1 && (
                <select
                  value={classFilter}
                  onChange={(e) => updateClassFilter(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 sm:flex-none"
                >
                  <option value="ALL">All Classes</option>
                  {classOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
              <select
                value={statusFilter}
                onChange={(e) => updateStatusFilter(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 sm:flex-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-500">
            No sessions match your filters.
          </p>
        ) : (
          <>
            {/* Mobile: stacked cards instead of a cramped, horizontally-scrolling table */}
            <div className="mt-4 space-y-2.5 sm:hidden">
              {paginatedSessions.map((session) => {
                const isPresent = session.statusLabel === "Present";
                const isLate = session.statusLabel === "Late";

                return (
                  <div
                    key={session.id}
                    className="rounded-xl border border-gray-100 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{session.class}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {session.dateLabel} &middot; {session.time}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          isPresent
                            ? "bg-green-50 text-green-700"
                            : isLate
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {session.statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop / tablet: table */}
            <div className="mt-4 hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="py-3 pr-4 font-semibold">Date</th>
                    <th className="py-3 pr-4 font-semibold">Class</th>
                    <th className="py-3 pr-4 font-semibold">Time</th>
                    <th className="py-3 pl-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedSessions.map((session) => {
                    const isPresent = session.statusLabel === "Present";
                    const isLate = session.statusLabel === "Late";

                    return (
                      <tr key={session.id}>
                        <td className="py-3 pr-4 text-gray-700">{session.dateLabel}</td>
                        <td className="py-3 pr-4 text-gray-700">{session.class}</td>
                        <td className="py-3 pr-4 text-gray-700">{session.time}</td>
                        <td className="py-3 pl-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isPresent
                                ? "bg-green-50 text-green-700"
                                : isLate
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {session.statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
