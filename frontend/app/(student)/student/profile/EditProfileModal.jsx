"use client";

import { useState } from "react";
import { apiUpdateMyProfile } from "@/Api/student/studentApi";
import { apiUploadStudentImage } from "@/Api/student/uploadApi";

function toDateInputValue(dob) {
  if (!dob) return "";
  return new Date(dob).toISOString().slice(0, 10);
}

export default function EditProfileModal({ data, onClose, onSaved }) {
  const [photoUrl, setPhotoUrl] = useState(data.photoUrl || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({
    phone: data.phone || "",
    dob: toDateInputValue(data.dob),
    guardianName: data.guardianName || "",
    guardianPhone: data.guardianPhone || "",
    address: data.address || "",
  });
  const [saving, setSaving] = useState(false);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const url = await apiUploadStudentImage(file, "students");
    if (url) setPhotoUrl(url);
    setUploadingPhoto(false);
    e.target.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const updated = await apiUpdateMyProfile({
      phone: form.phone,
      dob: form.dob || null,
      guardianName: form.guardianName,
      guardianPhone: form.guardianPhone,
      address: form.address,
      photoUrl,
    });
    setSaving(false);
    if (updated) onSaved(updated);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-gray-900">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Profile photo */}
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gradient-to-tr from-[#D63E82] via-[#E66DA4] to-[#F298BE]">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <label className="cursor-pointer rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-[#E11D48] hover:text-[#E11D48]">
              {uploadingPhoto ? "Uploading…" : "Change Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={uploadingPhoto}
                className="hidden"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Phone</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Date of Birth</span>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">Guardian Name</span>
              <input
                type="text"
                value={form.guardianName}
                onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">Guardian Phone</span>
              <input
                type="tel"
                value={form.guardianPhone}
                onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Address</span>
            <textarea
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full resize-none rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingPhoto}
              className="flex-1 rounded-full bg-[#E11D48] py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#D81B60] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
