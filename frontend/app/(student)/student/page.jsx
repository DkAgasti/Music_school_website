"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGetMyProfile } from "@/Api/student/studentApi";
import NoteIcon from "@/components/student/NoteIcon";

function StatCard({ label, children }) {
  return (
    <div className="rounded-xl border border-pink-100/70 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const student = { name: profile.studentName };
  const stats = {
    enrolledClasses: profile.dashboardMetrics.enrolledClassesCount,
    attendance: profile.dashboardMetrics.attendancePercentage,
    progressStatus: profile.dashboardMetrics.progressStatus,
  };
  const enrolledClasses = profile.enrolledClasses;
  const progressNotes = profile.progressNotes.map((n) => ({
    id: n.id,
    class: n.className,
    note: n.note,
    date: n.date,
  }));

  const totalPaymentsLabel = `₹${profile.dashboardMetrics.totalFeePaidRupees.toLocaleString("en-IN")}`;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            Welcome, {student.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Here&rsquo;s your student overview</p>
        </div>

        
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Enrolled Classes">
          <p className="text-2xl font-bold text-gray-900">{stats.enrolledClasses}</p>
        </StatCard>

        <StatCard label="Attendance">
          <p className="text-2xl font-bold text-gray-900">{stats.attendance}</p>
        </StatCard>

        <StatCard label="Progress">
          <p className="flex items-center gap-1.5 text-lg font-bold text-green-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {stats.progressStatus}
          </p>
        </StatCard>

        <StatCard label="Total Payments">
          <p className="text-2xl font-bold text-gray-900">{totalPaymentsLabel}</p>
        </StatCard>
      </div>

      {/* Enrolled Classes */}
      <div className="mt-6 rounded-2xl border border-pink-100/70 bg-white p-6 sm:p-7">
        <h2 className="font-serif text-xl font-bold text-gray-900">Enrolled Classes</h2>

        <div className="mt-4 divide-y divide-gray-100">
          {enrolledClasses.map((cls) => (
            <div
              key={cls.id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#E11D48]">
                  <NoteIcon />
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{cls.name}</p>
                  <p className="text-sm text-gray-500">{cls.schedule}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {cls.status}
                </span>
                <Link
                  href="/student/classes"
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Progress Notes */}
      <div className="mt-6 rounded-2xl border border-pink-100/70 bg-white p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-gray-900">Recent Progress Notes</h2>
          <Link href="/student/progress" className="text-sm font-semibold text-[#E11D48] hover:text-[#D81B60]">
            View All
          </Link>
        </div>

        <div className="mt-4 divide-y divide-gray-100">
          {progressNotes.map((note) => (
            <div key={note.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#E11D48]">
                  <NoteIcon />
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{note.class}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{note.note}</p>
                </div>
              </div>
              <p className="shrink-0 text-sm text-gray-400">
                {new Date(note.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
