"use client";

import { useEffect, useState } from "react";
import { apiGetMyProfile } from "@/Api/student/studentApi";
import Pagination from "@/components/student/Pagination";

const PAGE_SIZE = 8;

export default function StudentProgressPage() {
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

  const recentNotes = profile.progressNotes.map((n) => ({
    id: n.id,
    class: n.className,
    note: n.note,
    date: n.date,
  }));

  const totalPages = Math.max(1, Math.ceil(recentNotes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedNotes = recentNotes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // One progress bar per enrolled class — a student's rating in one class
  // says nothing about another, so each is computed from only its own
  // rated notes. No notes yet means no progress to show, so it's 0%, not
  // a guess based on attendance.
  const classes = profile.enrolledClasses.map((cls) => {
    const classRatedNotes = profile.progressNotes.filter(
      (n) => n.className === cls.name && n.rating != null
    );
    let percent = 0;
    if (classRatedNotes.length > 0) {
      const avgRating = classRatedNotes.reduce((sum, n) => sum + n.rating, 0) / classRatedNotes.length;
      percent = Math.round((avgRating / 5) * 100);
    }
    const level = percent >= 75 ? "Advanced" : percent >= 40 ? "Intermediate" : "Beginner";
    return { id: cls.enrollmentId, name: cls.name, level, percent };
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-gray-900">Progress Tracker</h1>
      <p className="mt-1 text-sm text-gray-500">Track your improvement across classes</p>

      {/* Progress bars */}
      <div className="mt-6 space-y-4">
        {classes.map((cls) => (
          <div key={cls.id} className="rounded-2xl border border-pink-100/70 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{cls.name}</p>
                <p className="mt-0.5 text-sm text-gray-500">{cls.level}</p>
              </div>
              <p className="text-lg font-bold text-[#E11D48]">{cls.percent}%</p>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#E11D48]"
                style={{ width: `${cls.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent notes */}
      <div className="mt-6 rounded-2xl border border-pink-100/70 bg-white p-4 sm:p-7">
        <h2 className="font-serif text-xl font-bold text-gray-900">Notes from Teachers</h2>

        {paginatedNotes.length === 0 ? (
          <p className="mt-6 text-center text-sm text-gray-500">No notes yet.</p>
        ) : (
          <>
            {/* Mobile: stacked cards instead of a cramped, horizontally-scrolling table */}
            <div className="mt-4 space-y-2.5 sm:hidden">
              {paginatedNotes.map((note) => (
                <div key={note.id} className="rounded-xl border border-gray-100 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-gray-900">{note.class}</p>
                    <p className="shrink-0 text-xs text-gray-400">
                      {new Date(note.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="mt-1.5 text-sm text-gray-700">{note.note}</p>
                </div>
              ))}
            </div>

            {/* Desktop / tablet: table */}
            <div className="mt-4 hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="bg-gray-50 py-3 pl-4 pr-4 font-semibold first:rounded-l-lg">Class</th>
                    <th className="bg-gray-50 py-3 pr-4 font-semibold">Note</th>
                    <th className="bg-gray-50 py-3 pr-4 font-semibold text-right last:rounded-r-lg">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedNotes.map((note) => (
                    <tr key={note.id}>
                      <td className="py-3 pl-4 pr-4 font-semibold text-gray-900">{note.class}</td>
                      <td className="py-3 pr-4 text-gray-700">{note.note}</td>
                      <td className="py-3 pr-4 text-right text-gray-400">
                        {new Date(note.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
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
