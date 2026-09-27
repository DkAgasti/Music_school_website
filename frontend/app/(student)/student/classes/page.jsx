"use client";

import { useEffect, useState } from "react";
import { apiGetMyProfile } from "@/Api/student/studentApi";
import NoteIcon from "@/components/student/NoteIcon";
import ClassDetailsModal from "./ClassDetailsModal";
import AddClassModal from "@/components/student/AddClassModal";

export default function StudentClassesPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAddClass, setShowAddClass] = useState(false);

  async function loadProfile({ forceRefresh = false } = {}) {
    const result = await apiGetMyProfile({ forceRefresh });
    if (result) setProfile(result);
    return result;
  }

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

  const classes = profile.enrolledClasses;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Enrolled Classes</h1>
          <p className="mt-1 text-sm text-gray-500">All classes you are currently enrolled in</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddClass(true)}
          className="self-start rounded-full bg-[#E11D48] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#D81B60] hover:shadow-md cursor-pointer"
        >
          + Join Another Class
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {classes.map((cls) => {
          const startedLabel = new Date(cls.startedDate).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={cls.id}
              className="flex flex-col gap-4 rounded-2xl border border-pink-100/70 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#E11D48]">
                  <NoteIcon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{cls.name}</p>
                  <p className="mt-0.5 text-sm text-gray-500">Teacher: {cls.teacher}</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {cls.schedule} &middot; Started: {startedLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pl-[3.25rem] sm:pl-0">
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {cls.status}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className="rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedClass && (
        <ClassDetailsModal
          cls={selectedClass}
          profile={profile}
          feeInfo={profile.paymentsSummary.classes.find((c) => c.enrollmentId === selectedClass.enrollmentId)}
          onClose={() => setSelectedClass(null)}
          onPaid={async () => {
            const updated = await loadProfile({ forceRefresh: true });
            if (updated) {
              const refreshed = updated.enrolledClasses.find((c) => c.enrollmentId === selectedClass.enrollmentId);
              if (refreshed) setSelectedClass(refreshed);
            }
          }}
        />
      )}

      {showAddClass && (
        <AddClassModal
          profile={profile}
          onClose={() => setShowAddClass(false)}
          onEnrolled={async () => {
            await loadProfile({ forceRefresh: true });
            setShowAddClass(false);
          }}
        />
      )}
    </div>
  );
}
