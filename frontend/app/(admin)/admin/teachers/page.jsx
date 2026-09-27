"use client";

import { useState, useEffect } from "react";
import {
  apiGetTeachers,
  apiCreateTeacher,
  apiUpdateTeacher,
  apiDeleteTeacher,
} from "@/Api/admin/teacherApi";
import { apiUploadImage } from "@/Api/admin/uploadApi";

const EMPTY_FORM = { name: "", bio: "", photoUrl: "" };

function mapTeacher(t) {
  return {
    id: t.id,
    name: t.name,
    bio: t.bio || "",
    photoUrl: t.photoUrl || "",
    classes: t.classes || [],
  };
}

export default function TeachersAdminPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [uploadingAdd, setUploadingAdd] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  async function handlePhotoFileChange(e, target) {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = target === "add" ? setUploadingAdd : setUploadingEdit;
    const setFormState = target === "add" ? setForm : setEditForm;

    setUploading(true);
    const url = await apiUploadImage(file, "teachers");
    setUploading(false);

    if (url) setFormState((prev) => ({ ...prev, photoUrl: url }));
  }

  async function loadTeachers() {
    const res = await apiGetTeachers();
    if (Array.isArray(res)) setTeachers(res.map(mapTeacher));
  }

  useEffect(() => {
    async function init() {
      setLoading(true);
      await loadTeachers();
      setLoading(false);
    }
    init();
  }, []);

  async function handleAddTeacher(e) {
    e.preventDefault();
    const created = await apiCreateTeacher({
      name: form.name,
      bio: form.bio || null,
      photoUrl: form.photoUrl || null,
    });
    if (!created) return;

    setShowAddModal(false);
    setForm(EMPTY_FORM);
    await loadTeachers();
  }

  function handleOpenEdit(teacher) {
    setEditingTeacher(teacher);
    setEditForm({
      name: teacher.name,
      bio: teacher.bio,
      photoUrl: teacher.photoUrl,
    });
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingTeacher) return;

    const updated = await apiUpdateTeacher(editingTeacher.id, {
      name: editForm.name,
      bio: editForm.bio || null,
      photoUrl: editForm.photoUrl || null,
    });
    if (!updated) return;

    setEditingTeacher(null);
    await loadTeachers();
  }

  async function handleDeleteTeacher(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    const ok = await apiDeleteTeacher(id);
    if (!ok) return;

    setTeachers((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Teachers
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Manage teachers. Assign classes to a teacher from the Classes page.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-[#BE123C] transition-colors cursor-pointer self-start sm:self-auto"
        >
          Add Teacher
        </button>
      </div>

      {loading && teachers.length === 0 && (
        <p className="text-sm text-gray-500">Loading teachers…</p>
      )}

      {!loading && teachers.length === 0 && (
        <div className="rounded-2xl border border-[#F3E2EC] bg-white p-8 text-center">
          <p className="text-sm text-gray-500">No teachers added yet.</p>
        </div>
      )}

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="rounded-2xl border border-[#F3E2EC] bg-white p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all"
          >
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                {teacher.photoUrl ? (
                  <img
                    src={teacher.photoUrl}
                    alt={teacher.name}
                    className="h-12 w-12 rounded-full object-cover shrink-0 border border-[#F3E2EC]"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-[#FDEEF5] text-[#E11D48] flex items-center justify-center shrink-0 font-serif text-lg font-bold">
                    {teacher.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-lg font-bold text-gray-900 leading-tight truncate">
                    {teacher.name}
                  </h3>
                  {teacher.bio && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{teacher.bio}</p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#F9EBF2]">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Teaches
                </p>
                {teacher.classes.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No classes assigned yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.classes.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center rounded-full bg-[#FDEEF5] px-2.5 py-0.5 text-[11px] font-medium text-[#E11D48]"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-4 border-t border-[#F9EBF2] mt-4">
              <button
                onClick={() => handleOpenEdit(teacher)}
                title="Edit Teacher"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                title="Delete Teacher"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FFE4E6] transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC] max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">Add New Teacher</h3>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rohan Verma"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bio</label>
                <input
                  type="text"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Short bio / specialization"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Photo</label>
                <div className="flex items-center gap-3">
                  {form.photoUrl ? (
                    <img
                      src={form.photoUrl}
                      alt="Preview"
                      className="h-12 w-12 rounded-full object-cover border border-[#F3E2EC]"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-100 shrink-0" />
                  )}
                  <label className="flex-1 cursor-pointer rounded-xl border border-dashed border-[#F3E2EC] px-3.5 py-2 text-xs text-gray-500 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors text-center">
                    {uploadingAdd ? "Uploading…" : form.photoUrl ? "Change photo" : "Upload photo from your computer"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoFileChange(e, "add")}
                      disabled={uploadingAdd}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F3E2EC]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C] cursor-pointer"
                >
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC] max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Edit Teacher: {editingTeacher.name}
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bio</label>
                <input
                  type="text"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Photo</label>
                <div className="flex items-center gap-3">
                  {editForm.photoUrl ? (
                    <img
                      src={editForm.photoUrl}
                      alt="Preview"
                      className="h-12 w-12 rounded-full object-cover border border-[#F3E2EC]"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-100 shrink-0" />
                  )}
                  <label className="flex-1 cursor-pointer rounded-xl border border-dashed border-[#F3E2EC] px-3.5 py-2 text-xs text-gray-500 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors text-center">
                    {uploadingEdit ? "Uploading…" : "Change photo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoFileChange(e, "edit")}
                      disabled={uploadingEdit}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F3E2EC]">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C] cursor-pointer"
                >
                  Update Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
