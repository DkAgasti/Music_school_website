"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const DEFAULT_CLASSES = [
  { id: "c-1", name: "Vocals", teacher: "Ishaan Kapoor", studentsCount: 18, feeRange: "₹2,000 – ₹3,000", status: "Active" },
  { id: "c-2", name: "Guitar", teacher: "Amit Singh", studentsCount: 26, feeRange: "₹2,000 – ₹3,500", status: "Active" },
  { id: "c-3", name: "Piano", teacher: "Sneha Verma", studentsCount: 22, feeRange: "₹2,500 – ₹4,000", status: "Active" },
  { id: "c-4", name: "Tabla", teacher: "Rohit Kulkarni", studentsCount: 14, feeRange: "₹2,000 – ₹3,000", status: "Active" },
  { id: "c-5", name: "Violin", teacher: "Kavya Menon", studentsCount: 9, feeRange: "₹2,500 – ₹3,500", status: "Active" },
  { id: "c-6", name: "Drums", teacher: "Arjun Das", studentsCount: 7, feeRange: "₹2,500 – ₹3,500", status: "Active" },
];

export default function ClassesAdminPage() {
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form, setForm] = useState({ name: "", teacher: "", feeRange: "₹2,000 – ₹3,500" });
  const [editForm, setEditForm] = useState({ name: "", teacher: "", feeRange: "" });

  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await api.get("/classes");
        if (res && Array.isArray(res) && res.length > 0) {
          const mapped = res.map((c, index) => ({
            id: c.id,
            name: c.name,
            teacher: c.teachers?.[0]?.name || DEFAULT_CLASSES[index % DEFAULT_CLASSES.length].teacher,
            studentsCount: c._count?.students || DEFAULT_CLASSES[index % DEFAULT_CLASSES.length].studentsCount,
            feeRange: c.feePlans?.[0] ? `₹${(c.feePlans[0].amount / 100).toLocaleString("en-IN")}` : DEFAULT_CLASSES[index % DEFAULT_CLASSES.length].feeRange,
            status: c.active ? "Active" : "Inactive",
          }));
          setClasses(mapped);
        }
      } catch (err) {
        console.warn("Using template classes:", err.message);
      }
    }
    loadClasses();
  }, []);

  // Add new class
  function handleAddClass(e) {
    e.preventDefault();
    const newEntry = {
      id: `c-${Date.now()}`,
      name: form.name,
      teacher: form.teacher || "Faculty Instructor",
      studentsCount: 0,
      feeRange: form.feeRange,
      status: "Active",
    };
    setClasses([newEntry, ...classes]);
    setShowAddModal(false);
    setForm({ name: "", teacher: "", feeRange: "₹2,000 – ₹3,500" });
  }

  // Open Edit Modal
  function handleOpenEdit(item) {
    setEditingClass(item);
    setEditForm({
      name: item.name,
      teacher: item.teacher,
      feeRange: item.feeRange,
    });
  }

  // Save Edit
  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingClass) return;

    setClasses((prev) =>
      prev.map((c) =>
        c.id === editingClass.id
          ? { ...c, name: editForm.name, teacher: editForm.teacher, feeRange: editForm.feeRange }
          : c
      )
    );
    setEditingClass(null);
  }

  // Delete Class
  function handleDeleteClass(id, name) {
    if (!confirm(`Are you sure you want to delete the "${name}" class?`)) return;

    setClasses((prev) => prev.filter((c) => c.id !== id));

    if (!id.startsWith("c-")) {
      try {
        api.delete(`/classes/${id}`, { auth: true }).catch(() => {});
      } catch (err) {
        console.warn("Class delete err:", err.message);
      }
    }
  }

  // Toggle Active / Inactive
  function handleToggleStatus(id) {
    let nextState = "Active";
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          nextState = c.status === "Active" ? "Inactive" : "Active";
          return { ...c, status: nextState };
        }
        return c;
      })
    );

    if (!id.startsWith("c-")) {
      try {
        api.patch(`/classes/${id}`, { active: nextState === "Active" }, { auth: true }).catch(() => {});
      } catch (err) {
        console.warn("Class status toggle err:", err.message);
      }
    }
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

      {/* 6 Classes Cards Grid */}
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
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 font-serif text-lg font-bold ${
                      isActive
                        ? "bg-[#FDEEF5] text-[#E11D48]"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    ♪
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-lg font-bold text-gray-900 leading-tight truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.teacher}</p>
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
                    <p className="text-[11px] font-medium text-gray-500">Fee / month</p>
                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {item.feeRange}
                    </p>
                  </div>
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

                {/* 3. Active / Inactive Toggle Icon Button */}
                <button
                  onClick={() => handleToggleStatus(item.id)}
                  title={isActive ? "Currently Active — Click to set Inactive" : "Currently Inactive — Click to set Active"}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                    isActive
                      ? "bg-[#E8F8EE] text-[#16A34A] hover:bg-[#d5ecd8]"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {isActive ? (
                    <>
                      <svg className="h-3.5 w-3.5 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <span>Inactive</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Add New Class
            </h3>
            <form onSubmit={handleAddClass} className="space-y-4">
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
                  Assigned Teacher
                </label>
                <input
                  required
                  type="text"
                  value={form.teacher}
                  onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                  placeholder="e.g. Ramesh Varma"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Fee Range
                </label>
                <input
                  type="text"
                  value={form.feeRange}
                  onChange={(e) => setForm({ ...form, feeRange: e.target.value })}
                  placeholder="e.g. ₹2,000 – ₹3,500"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F3E2EC]">
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
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">
              Edit Class: {editingClass.name}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Update class details, teacher, or fee pricing.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
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
                  Assigned Teacher
                </label>
                <input
                  required
                  type="text"
                  value={editForm.teacher}
                  onChange={(e) => setEditForm({ ...editForm, teacher: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Fee Range
                </label>
                <input
                  type="text"
                  value={editForm.feeRange}
                  onChange={(e) => setEditForm({ ...editForm, feeRange: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F3E2EC]">
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
    </div>
  );
}
