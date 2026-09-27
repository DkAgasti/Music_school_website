"use client";

import { useState, useEffect } from "react";
import { apiGetClasses } from "@/Api/admin/classApi";
import {
  apiGetBatches,
  apiCreateBatch,
  apiUpdateBatch,
  apiDeleteBatch,
} from "@/Api/admin/batchApi";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 20;

// Maps a raw batch record from the backend into the shape this page renders.
function mapBatch(b) {
  const capacity = b.capacity ?? 10;
  const enrolled = b._count?.enrollments ?? b.enrollments?.length ?? 0;
  return {
    id: b.id,
    classId: b.classId,
    batch: b.name,
    className: b.class?.name || "—",
    schedule: b.schedule || "",
    teacher: b.teacherName || b.class?.teachers?.[0]?.name || "Unassigned",
    capacity,
    seatsLeft: b.seatsLeft ?? Math.max(capacity - enrolled, 0),
    active: b.active ?? true,
  };
}

const EMPTY_ADD_FORM = { name: "", classId: "", schedule: "", capacity: 15 };
const EMPTY_EDIT_FORM = { name: "", classId: "", schedule: "", capacity: 15 };

export default function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [classesList, setClassesList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);

  async function loadBatches(pageToLoad) {
    const res = await apiGetBatches(undefined, { page: pageToLoad, limit: PAGE_SIZE });
    if (res && Array.isArray(res.items)) {
      setBatches(res.items.map(mapBatch));
      setTotalPages(res.totalPages);
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [batchesRes, classesRes] = await Promise.all([
        apiGetBatches(undefined, { page, limit: PAGE_SIZE }),
        apiGetClasses(),
      ]);
      if (batchesRes && Array.isArray(batchesRes.items)) {
        setBatches(batchesRes.items.map(mapBatch));
        setTotalPages(batchesRes.totalPages);
      }
      if (Array.isArray(classesRes)) {
        const mappedClasses = classesRes.map((c) => ({ id: c.id, name: c.name }));
        setClassesList(mappedClasses);
        setAddForm((prev) => ({ ...prev, classId: prev.classId || mappedClasses[0]?.id || "" }));
      }
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Add new batch
  async function handleAddBatch(e) {
    e.preventDefault();
    if (!addForm.classId) return;

    const created = await apiCreateBatch({
      classId: addForm.classId,
      name: addForm.name,
      schedule: addForm.schedule,
      capacity: Number(addForm.capacity) || 15,
      active: true,
    });
    if (!created) return;

    setShowAddModal(false);
    setAddForm({ ...EMPTY_ADD_FORM, classId: classesList[0]?.id || "" });
    setPage(1);
    await loadBatches(1);
  }

  // Open Edit
  function handleOpenEdit(b) {
    setEditingBatch(b);
    setEditForm({
      name: b.batch,
      classId: b.classId || "",
      schedule: b.schedule,
      capacity: b.capacity || 15,
    });
  }

  // Save Edit
  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingBatch) return;

    const updated = await apiUpdateBatch(editingBatch.id, {
      classId: editForm.classId,
      name: editForm.name,
      schedule: editForm.schedule,
      capacity: Number(editForm.capacity) || 10,
    });
    if (!updated) return;

    setEditingBatch(null);
    await loadBatches(page);
  }

  // Toggle Active / Inactive
  async function handleToggleStatus(row) {
    const updated = await apiUpdateBatch(row.id, { active: !row.active });
    if (!updated) return;
    setBatches((prev) => prev.map((b) => (b.id === row.id ? mapBatch(updated) : b)));
  }

  // Delete Batch
  async function handleDeleteBatch(id, batchName) {
    if (!confirm(`Are you sure you want to delete batch "${batchName}"?`)) return;

    const ok = await apiDeleteBatch(id);
    if (!ok) return;

    await loadBatches(page);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Batches &amp; Timings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Schedule and manage class batches
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-[#BE123C] transition-colors cursor-pointer self-start sm:self-auto"
        >
          Add Batch
        </button>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-[#F3E2EC] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg font-bold text-gray-900">
            All Batches
          </h2>
        </div>

        {loading && batches.length === 0 && (
          <p className="text-sm text-gray-500 pb-4">Loading batches…</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="rounded-xl bg-[#FDEEF5] text-xs font-semibold text-gray-600">
                <th className="rounded-l-xl px-4 py-3 font-semibold text-gray-600">Batch</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Class</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Schedule</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Teacher</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Seats</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                <th className="rounded-r-xl px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9EBF2] text-sm">
              {batches.map((row) => (
                <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-gray-900 font-mono text-xs">
                    {row.batch}
                  </td>
                  <td className="px-4 py-3.5 text-gray-700">{row.className}</td>
                  <td className="px-4 py-3.5 text-gray-600">{row.schedule}</td>
                  <td className="px-4 py-3.5 text-gray-700">{row.teacher}</td>
                  <td className="px-4 py-3.5 font-medium text-gray-700">
                    {row.seatsLeft} left
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={row.active}
                        onClick={() => handleToggleStatus(row)}
                        title={row.active ? "Active — click to set Inactive" : "Inactive — click to set Active"}
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                          row.active ? "bg-[#16A34A]" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                            row.active ? "translate-x-[18px]" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className={`text-xs font-medium ${row.active ? "text-[#16A34A]" : "text-gray-500"}`}>
                        {row.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {/* Edit Icon */}
                      <button
                        onClick={() => handleOpenEdit(row)}
                        title="Edit Batch"
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>

                      {/* Delete Icon */}
                      <button
                        onClick={() => handleDeleteBatch(row.id, row.batch)}
                        title="Delete Batch"
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FFE4E6] transition-colors cursor-pointer"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Edit Batch Modal */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Edit Batch: {editingBatch.batch}
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Batch Code
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
                  Class
                </label>
                <select
                  required
                  value={editForm.classId}
                  onChange={(e) => setEditForm({ ...editForm, classId: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                >
                  <option value="" disabled>
                    Select a class
                  </option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Schedule
                </label>
                <input
                  required
                  type="text"
                  value={editForm.schedule}
                  onChange={(e) => setEditForm({ ...editForm, schedule: e.target.value })}
                  placeholder="e.g. Mon/Wed/Fri 9:00 AM - 10:30 AM"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Capacity (Seats)
                </label>
                <input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value, 10) || 15 })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F3E2EC]">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C] cursor-pointer"
                >
                  Update Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Batch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Add New Batch
            </h3>
            <form onSubmit={handleAddBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Batch Code
                </label>
                <input
                  required
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. G-EVE-3"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Class
                </label>
                <select
                  required
                  value={addForm.classId}
                  onChange={(e) => setAddForm({ ...addForm, classId: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                >
                  <option value="" disabled>
                    Select a class
                  </option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Schedule
                </label>
                <input
                  required
                  type="text"
                  value={addForm.schedule}
                  onChange={(e) => setAddForm({ ...addForm, schedule: e.target.value })}
                  placeholder="e.g. Mon/Wed/Fri 9:00 AM - 10:30 AM"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Capacity (Seats)
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={addForm.capacity}
                  onChange={(e) => setAddForm({ ...addForm, capacity: e.target.value })}
                  placeholder="e.g. 15"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
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
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
