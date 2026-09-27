"use client";

import { useEffect, useState } from "react";
import { apiGetMyProfile } from "@/Api/student/studentApi";
import EditProfileModal from "./EditProfileModal";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function StudentProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await apiGetMyProfile();
      if (!cancelled && result) setData(result);
      if (!cancelled) setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (!data) return <p className="text-sm text-gray-500">Failed to load your data.</p>;

  const profile = {
    name: data.studentName,
    studentIdLabel: data.studentId.slice(-8).toUpperCase(),
    status: data.active ? "Active" : "Inactive",
    memberSince: data.joinedDate,
    email: data.email,
    phone: data.phone,
    dob: data.dob,
    photoUrl: data.photoUrl,
    guardianName: data.guardianName || "—",
    guardianPhone: data.guardianPhone || "—",
    address: data.address || "—",
  };

  const memberSince = new Date(profile.memberSince).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const dob = profile.dob
    ? new Date(profile.dob).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your personal information</p>
        </div>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 self-start rounded-full bg-[#E11D48] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#D81B60] hover:shadow-md cursor-pointer"
        >
          Edit Profile
        </button>
      </div>

      {/* Identity card */}
      <div className="mt-6 rounded-2xl border border-pink-100/70 bg-white p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-[#D63E82] via-[#E66DA4] to-[#F298BE] text-white">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">{profile.name}</h2>
            <p className="mt-0.5 text-sm text-gray-500">Student ID: {profile.studentIdLabel}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                {profile.status}
              </span>
              <span className="text-xs text-gray-500">Member since {memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal information */}
      <div className="mt-6 rounded-2xl border border-pink-100/70 bg-white p-6 sm:p-7">
        <h2 className="font-serif text-xl font-bold text-gray-900">Personal Information</h2>

        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field label="Email" value={profile.email} />
          <Field label="Phone" value={profile.phone} />
          <Field label="Date of Birth" value={dob} />
          <Field label="Guardian Name" value={profile.guardianName} />
          <Field label="Guardian Phone" value={profile.guardianPhone} />
          <Field label="Address" value={profile.address} />
        </div>
      </div>

      {editing && (
        <EditProfileModal
          data={data}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setData(updated);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}
