"use client";

import { useState, useEffect } from "react";
import {
  apiGetClasses,
  apiCreateClass,
  apiUpdateClass,
  apiDeleteClass,
} from "@/Api/admin/classApi";
import {
  apiCreateFeePlan,
  apiUpdateFeePlan,
  apiDeleteFeePlan,
} from "@/Api/admin/feePlanApi";
import { apiGetTeachers } from "@/Api/admin/teacherApi";
import { apiUploadImage } from "@/Api/admin/uploadApi";

// A dropdown button that opens a checkbox list — lets the admin check off
// one or more teachers instead of Cmd/Ctrl-clicking a native <select>.
function TeacherMultiSelectDropdown({ teachers, selectedIds, onChange }) {
  const [open, setOpen] = useState(false);

  function toggle(id) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  }

  const selectedNames = teachers.filter((t) => selectedIds.includes(t.id)).map((t) => t.name);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm text-left focus:outline-none focus:border-[#E11D48] bg-white cursor-pointer"
      >
        <span className={selectedNames.length ? "text-gray-800 truncate" : "text-gray-400"}>
          {selectedNames.length ? selectedNames.join(", ") : "Select teacher(s)"}
        </span>
        <svg className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Not absolutely positioned on purpose — it pushes the rest of the
          form (Cancel/Save buttons) down instead of overlaying on top of
          them, and the modal's own overflow-y-auto lets you scroll to it. */}
      {open && (
        <div className="mt-1 w-full rounded-xl border border-[#F3E2EC] bg-white shadow-sm max-h-48 overflow-y-auto p-2">
          {teachers.length === 0 ? (
            <p className="text-xs text-gray-400 px-2 py-1.5">No teachers added yet.</p>
          ) : (
            teachers.map((t) => (
              <label
                key={t.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-[#FFF7FB] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(t.id)}
                  onChange={() => toggle(t.id)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-[#E11D48] focus:ring-[#E11D48]/30"
                />
                {t.name}
              </label>
            ))
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-1 w-full rounded-lg bg-[#FDEEF5] px-2 py-1.5 text-xs font-semibold text-[#E11D48] cursor-pointer"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

const COURSE_DURATION_OPTIONS = [1, 2, 3, 6, 8, 9, 12, 18, 24];

// Maps a raw class record from the backend into the shape this page renders.
function mapClass(c) {
  const teachers = c.teachers || [];
  return {
    id: c.id,
    name: c.name,
    description: c.description || "",
    syllabus: c.syllabus || "",
    imageUrl: c.imageUrl || "",
    durationMonths: c.durationMonths || null,
    teachers,
    teacherNames: teachers.length ? teachers.map((t) => t.name).join(", ") : "Unassigned",
    studentsCount: c._count?.enrollments ?? 0,
    batchesCount: c.batches?.length ?? c._count?.batches ?? 0,
    active: !!c.active,
    status: c.active ? "Active" : "Inactive",
    feePlans: c.feePlans || [],
  };
}

const EMPTY_CLASS_FORM = { name: "", description: "", syllabus: "", imageUrl: "", durationMonths: "", teacherIds: [] };

export default function ClassesAdminPage() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form, setForm] = useState(EMPTY_CLASS_FORM);
  const [editForm, setEditForm] = useState(EMPTY_CLASS_FORM);
  const [uploadingAdd, setUploadingAdd] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  async function handlePhotoFileChange(e, target) {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = target === "add" ? setUploadingAdd : setUploadingEdit;
    const setFormState = target === "add" ? setForm : setEditForm;

    setUploading(true);
    const url = await apiUploadImage(file, "classes");
    setUploading(false);

    if (url) setFormState((prev) => ({ ...prev, imageUrl: url }));
  }

  // Fee Plan (course price) management
  const [feePlanModal, setFeePlanModal] = useState(null); // { classId, className, editingPlan } | null
  const [feePlanForm, setFeePlanForm] = useState({ name: "", amount: "", durationMonths: "1" });

  async function loadClasses() {
    const res = await apiGetClasses();
    if (Array.isArray(res)) {
      setClasses(res.map(mapClass));
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [, teachersRes] = await Promise.all([loadClasses(), apiGetTeachers()]);
      if (Array.isArray(teachersRes)) setTeachers(teachersRes);
      setLoading(false);
    }
    init();
  }, []);

  // Add new class
  async function handleAddClass(e) {
    e.preventDefault();
    const created = await apiCreateClass({
      name: form.name,
      description: form.description,
      syllabus: form.syllabus,
      imageUrl: form.imageUrl || null,
      durationMonths: form.durationMonths ? Number(form.durationMonths) : null,
      active: true,
      teacherIds: form.teacherIds,
    });
    if (!created) return;

    setShowAddModal(false);
    setForm(EMPTY_CLASS_FORM);
    await loadClasses();
  }

  // Open Edit Modal
  function handleOpenEdit(item) {
    setEditingClass(item);
    setEditForm({
      name: item.name,
      description: item.description,
      syllabus: item.syllabus,
      imageUrl: item.imageUrl,
      durationMonths: item.durationMonths || "",
      teacherIds: item.teachers.map((t) => t.id),
    });
  }

  // Save Edit
  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingClass) return;

    const updated = await apiUpdateClass(editingClass.id, {
      name: editForm.name,
      description: editForm.description,
      syllabus: editForm.syllabus,
      imageUrl: editForm.imageUrl || null,
      durationMonths: editForm.durationMonths ? Number(editForm.durationMonths) : null,
      teacherIds: editForm.teacherIds,
    });
    if (!updated) return;

    setEditingClass(null);
    await loadClasses();
  }

  // Delete Class
  async function handleDeleteClass(id, name) {
    if (!confirm(`Are you sure you want to delete the "${name}" class?`)) return;

    const ok = await apiDeleteClass(id);
    if (!ok) return;

    setClasses((prev) => prev.filter((c) => c.id !== id));
  }

  // Toggle Active / Inactive
  async function handleToggleStatus(item) {
    const nextActive = !item.active;
    const updated = await apiUpdateClass(item.id, { active: nextActive });
    if (!updated) return;

    await loadClasses();
  }

  // Open Add/Edit Fee Plan modal (price for a course)
  function handleOpenAddFeePlan(item) {
    setFeePlanModal({ classId: item.id, className: item.name, editingPlan: null });
    setFeePlanForm({ name: "", amount: "", durationMonths: "1" });
  }

  function handleOpenEditFeePlan(item, plan) {
    setFeePlanModal({ classId: item.id, className: item.name, editingPlan: plan });
    setFeePlanForm({
      name: plan.name,
      amount: String(Math.round(plan.amount / 100)),
      durationMonths: String(plan.durationMonths),
    });
  }

  async function handleSaveFeePlan(e) {
    e.preventDefault();
    if (!feePlanModal) return;

    const payload = {
      classId: feePlanModal.classId,
      name: feePlanForm.name,
      amount: Math.round(Number(feePlanForm.amount) * 100), // rupees -> paise
      durationMonths: Number(feePlanForm.durationMonths) || 1,
    };

    const saved = feePlanModal.editingPlan
      ? await apiUpdateFeePlan(feePlanModal.editingPlan.id, payload)
      : await apiCreateFeePlan(payload);

    if (!saved) return;

    setFeePlanModal(null);
    await loadClasses();
  }

  async function handleDeleteFeePlan(planId, planName) {
    if (!confirm(`Delete the "${planName}" fee plan?`)) return;

    const ok = await apiDeleteFeePlan(planId);
    if (!ok) return;

    await loadClasses();
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Classes
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Manage all classes offered
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-[#BE123C] transition-colors cursor-pointer self-start sm:self-auto"
        >
          Add Class
        </button>
      </div>

      {loading && classes.length === 0 && (
        <p className="text-sm text-gray-500">Loading classes…</p>
      )}

      {/* Classes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((item) => {
          const isActive = item.status === "Active";

          return (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all ${
                isActive ? "border-[#F3E2EC]" : "border-gray-200 opacity-85"
              }`}
            >
              <div>
                {/* Header with Music Icon & Titles */}
                <div className="flex items-center gap-3.5 mb-6">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-10 w-10 rounded-full object-cover shrink-0 border border-[#F3E2EC]"
                    />
                  ) : (
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 font-serif text-lg font-bold ${
                        isActive
                          ? "bg-[#FDEEF5] text-[#E11D48]"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      ♪
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-lg font-bold text-gray-900 leading-tight truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.teacherNames}</p>
                    {item.durationMonths && (
                      <p className="text-[11px] text-[#E11D48] font-medium mt-0.5">
                        {item.durationMonths} Month{item.durationMonths > 1 ? "s" : ""} Course
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 pt-2 pb-4 border-t border-[#F9EBF2]">
                  <div>
                    <p className="text-[11px] font-medium text-gray-500">Students Enrolled</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {item.studentsCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-gray-500">Batches</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {item.batchesCount}
                    </p>
                  </div>
                </div>

                {/* Fee Plans (course price) */}
                <div className="pt-3 pb-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Fee Plans
                    </p>
                    <button
                      onClick={() => handleOpenAddFeePlan(item)}
                      className="text-[11px] font-semibold text-[#E11D48] hover:underline cursor-pointer"
                    >
                      + Add Price
                    </button>
                  </div>

                  {item.feePlans.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No price set yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {item.feePlans.map((plan) => (
                        <div
                          key={plan.id}
                          className="flex items-center justify-between rounded-lg bg-[#FFF7FB] px-2.5 py-1.5 text-xs"
                        >
                          <div className="min-w-0">
                            <span className="font-medium text-gray-800">{plan.name}</span>
                            <span className="text-gray-400"> · {plan.durationMonths} mo</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-semibold text-gray-900">
                              ₹{Math.round(plan.amount / 100).toLocaleString("en-IN")}
                            </span>
                            <button
                              onClick={() => handleOpenEditFeePlan(item, plan)}
                              title="Edit Price"
                              className="text-gray-400 hover:text-[#E11D48] cursor-pointer"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteFeePlan(plan.id, plan.name)}
                              title="Delete Price"
                              className="text-gray-400 hover:text-[#E11D48] cursor-pointer"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar: 1st Edit, 2nd Delete, 3rd Active/Inactive Toggle */}
              <div className="flex items-center justify-end gap-1.5 pt-4 border-t border-[#F9EBF2] mt-2">
                {/* 1. Edit Icon */}
                <button
                  onClick={() => handleOpenEdit(item)}
                  title="Edit Class"
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

                {/* 2. Delete Icon */}
                <button
                  onClick={() => handleDeleteClass(item.id, item.name)}
                  title="Delete Class"
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

                {/* 3. Active / Inactive Toggle */}
                <div className="flex items-center gap-2 pl-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    onClick={() => handleToggleStatus(item)}
                    title={isActive ? "Active — click to set Inactive" : "Inactive — click to set Active"}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                      isActive ? "bg-[#16A34A]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        isActive ? "translate-x-[18px]" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-medium ${isActive ? "text-[#16A34A]" : "text-gray-500"}`}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md h-[min(620px,85vh)] rounded-2xl bg-white shadow-xl border border-[#F3E2EC] flex flex-col overflow-hidden">
            <form onSubmit={handleAddClass} className="flex flex-col flex-1 min-h-0">
              <h3 className="font-serif text-xl font-bold text-gray-900 px-6 pt-6 pb-4 shrink-0">
                Add New Class
              </h3>
              <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Class Name
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Flute / Cello"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of the class"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Syllabus
                </label>
                <input
                  type="text"
                  value={form.syllabus}
                  onChange={(e) => setForm({ ...form, syllabus: e.target.value })}
                  placeholder="e.g. Beginner to Grade 3"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Course Duration
                </label>
                <select
                  value={form.durationMonths}
                  onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                >
                  <option value="">Not set</option>
                  {COURSE_DURATION_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m} Month{m > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Photo</label>
                <div className="flex items-center gap-3">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="h-12 w-12 rounded-full object-cover border border-[#F3E2EC]"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-100 shrink-0" />
                  )}
                  <label className="flex-1 cursor-pointer rounded-xl border border-dashed border-[#F3E2EC] px-3.5 py-2 text-xs text-gray-500 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors text-center">
                    {uploadingAdd ? "Uploading…" : form.imageUrl ? "Change image" : "Upload image from your computer"}
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
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Teacher(s)
                </label>
                <TeacherMultiSelectDropdown
                  teachers={teachers}
                  selectedIds={form.teacherIds}
                  onChange={(ids) => setForm({ ...form, teacherIds: ids })}
                />
              </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 pt-3 border-t border-[#F3E2EC] shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C]"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md h-[min(620px,85vh)] rounded-2xl bg-white shadow-xl border border-[#F3E2EC] flex flex-col overflow-hidden">
            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 min-h-0">
              <div className="px-6 pt-6 pb-4 shrink-0">
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">
                  Edit Class: {editingClass.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Update class details, description, or syllabus.
                </p>
              </div>
              <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Class Name
                </label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Syllabus
                </label>
                <input
                  type="text"
                  value={editForm.syllabus}
                  onChange={(e) => setEditForm({ ...editForm, syllabus: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Course Duration
                </label>
                <select
                  value={editForm.durationMonths}
                  onChange={(e) => setEditForm({ ...editForm, durationMonths: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                >
                  <option value="">Not set</option>
                  {COURSE_DURATION_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m} Month{m > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Photo</label>
                <div className="flex items-center gap-3">
                  {editForm.imageUrl ? (
                    <img
                      src={editForm.imageUrl}
                      alt="Preview"
                      className="h-12 w-12 rounded-full object-cover border border-[#F3E2EC]"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-100 shrink-0" />
                  )}
                  <label className="flex-1 cursor-pointer rounded-xl border border-dashed border-[#F3E2EC] px-3.5 py-2 text-xs text-gray-500 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors text-center">
                    {uploadingEdit ? "Uploading…" : "Change image"}
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
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Teacher(s)
                </label>
                <TeacherMultiSelectDropdown
                  teachers={teachers}
                  selectedIds={editForm.teacherIds}
                  onChange={(ids) => setEditForm({ ...editForm, teacherIds: ids })}
                />
              </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 pt-3 border-t border-[#F3E2EC] shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C]"
                >
                  Update Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Fee Plan (Course Price) Modal */}
      {feePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">
              {feePlanModal.editingPlan ? "Edit" : "Add"} Fee Plan — {feePlanModal.className}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Set the price students pay to enroll in this class.
            </p>

            <form onSubmit={handleSaveFeePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Plan Name
                </label>
                <input
                  required
                  type="text"
                  value={feePlanForm.name}
                  onChange={(e) => setFeePlanForm({ ...feePlanForm, name: e.target.value })}
                  placeholder="e.g. Monthly / Quarterly / Yearly"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={feePlanForm.amount}
                    onChange={(e) => setFeePlanForm({ ...feePlanForm, amount: e.target.value })}
                    placeholder="e.g. 2500"
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Duration (months)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={feePlanForm.durationMonths}
                    onChange={(e) => setFeePlanForm({ ...feePlanForm, durationMonths: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F3E2EC]">
                <button
                  type="button"
                  onClick={() => setFeePlanModal(null)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C]"
                >
                  {feePlanModal.editingPlan ? "Update Price" : "Save Price"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
