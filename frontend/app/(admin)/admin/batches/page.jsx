"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const DEFAULT_BATCHES = [
  { id: "b-1", batch: "G-EVE-1", class: "Guitar", days: "Mon & Wed", timing: "5:00 PM – 6:00 PM", teacher: "Amit Singh", seats: "5 left", capacity: 15 },
  { id: "b-2", batch: "G-EVE-2", class: "Guitar", days: "Tue & Thu", timing: "6:00 PM – 7:00 PM", teacher: "Amit Singh", seats: "2 left", capacity: 15 },
  { id: "b-3", batch: "P-EVE-1", class: "Piano", days: "Tue & Thu", timing: "4:00 PM – 5:00 PM", teacher: "Sneha Verma", seats: "4 left", capacity: 12 },
  { id: "b-4", batch: "V-MOR-1", class: "Vocals", days: "Mon & Fri", timing: "10:00 AM – 11:00 AM", teacher: "Ishaan Kapoor", seats: "8 left", capacity: 15 },
  { id: "b-5", batch: "T-WKD-1", class: "Tabla", days: "Sat", timing: "9:00 AM – 10:30 AM", teacher: "Rohit Kulkarni", seats: "6 left", capacity: 12 },
  { id: "b-6", batch: "M-WKD-1", class: "Music Theory", days: "Sat", timing: "11:00 AM – 12:00 PM", teacher: "Priya Nair", seats: "10 left", capacity: 20 },
  { id: "b-7", batch: "D-EVE-1", class: "Drums", days: "Wed & Fri", timing: "6:00 PM – 7:00 PM", teacher: "Arjun Das", seats: "3 left", capacity: 10 },
];

export default function BatchesPage() {
  const [batches, setBatches] = useState(DEFAULT_BATCHES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  const [addForm, setAddForm] = useState({ batch: "", class: "Guitar", days: "Mon & Wed", timing: "5:00 PM – 6:00 PM", teacher: "", capacity: 15 });
  const [editForm, setEditForm] = useState({ batch: "", class: "Guitar", days: "Mon & Wed", timing: "", teacher: "", capacity: 15 });

  useEffect(() => {
    async function loadBatches() {
      try {
        const res = await api.get("/classes/batches/all");
        if (res && Array.isArray(res) && res.length > 0) {
          const mapped = res.map((b) => ({
            id: b.id,
            batch: b.name,
            class: b.class?.name || "Guitar",
            days: b.schedule?.split(" ")[0] || "Mon & Wed",
            timing: b.schedule?.includes("at") ? b.schedule.split("at")[1] : "5:00 PM – 6:00 PM",
            teacher: b.teacher?.name || "Instructor",
            seats: `${b.capacity || 10} left`,
            capacity: b.capacity || 15,
          }));
          setBatches(mapped);
        }
      } catch (err) {
        console.warn("Using template batches:", err.message);
      }
    }
    loadBatches();
  }, []);

  // Add new batch (prepends to top)
  function handleAddBatch(e) {
    e.preventDefault();
    const newEntry = {
      id: `b-${Date.now()}`,
      batch: addForm.batch || `B-EVE-${batches.length + 1}`,
      class: addForm.class,
      days: addForm.days,
      timing: addForm.timing,
      teacher: addForm.teacher || "Faculty Instructor",
      seats: `${addForm.capacity} left`,
      capacity: addForm.capacity,
    };
    setBatches([newEntry, ...batches]);
    setShowAddModal(false);
    setAddForm({ batch: "", class: "Guitar", days: "Mon & Wed", timing: "5:00 PM – 6:00 PM", teacher: "", capacity: 15 });
  }

  // Open Edit
  function handleOpenEdit(b) {
    setEditingBatch(b);
    setEditForm({
      batch: b.batch,
      class: b.class,
      days: b.days,
      timing: b.timing,
      teacher: b.teacher,
      capacity: b.capacity || 15,
    });
  }

  // Save Edit
  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingBatch) return;

    setBatches((prev) =>
      prev.map((b) =>
        b.id === editingBatch.id
          ? {
              ...b,
              batch: editForm.batch,
              class: editForm.class,
              days: editForm.days,
              timing: editForm.timing,
              teacher: editForm.teacher,
              capacity: editForm.capacity,
              seats: `${editForm.capacity} left`,
            }
          : b
      )
    );
    setEditingBatch(null);
  }

  // Delete Batch
  function handleDeleteBatch(id, batchName) {
    if (!confirm(`Are you sure you want to delete batch "${batchName}"?`)) return;
    setBatches((prev) => prev.filter((b) => b.id !== id));
    if (!id.startsWith("b-")) {
      api.delete(`/classes/batches/${id}`, { auth: true }).catch(() => {});
    }
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="rounded-xl bg-[#FDEEF5] text-xs font-semibold text-gray-600">
                <th className="rounded-l-xl px-4 py-3 font-semibold text-gray-600">Batch</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Class</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Days</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Timing</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Teacher</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Seats</th>
                <th className="rounded-r-xl px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9EBF2] text-sm">
              {batches.map((row) => (
                <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-gray-900 font-mono text-xs">
                    {row.batch}
                  </td>
                  <td className="px-4 py-3.5 text-gray-700">{row.class}</td>
                  <td className="px-4 py-3.5 text-gray-600">{row.days}</td>
                  <td className="px-4 py-3.5 text-gray-600">{row.timing}</td>
                  <td className="px-4 py-3.5 text-gray-700">{row.teacher}</td>
                  <td className="px-4 py-3.5 font-medium text-gray-700">
                    {row.seats}
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
                  value={editForm.batch}
                  onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Days
                </label>
                <input
                  required
                  type="text"
                  value={editForm.days}
                  onChange={(e) => setEditForm({ ...editForm, days: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Timing
                </label>
                <input
                  required
                  type="text"
                  value={editForm.timing}
                  onChange={(e) => setEditForm({ ...editForm, timing: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Teacher
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
                  type="text"
                  value={addForm.batch}
                  onChange={(e) => setAddForm({ ...addForm, batch: e.target.value })}
                  placeholder="e.g. G-EVE-3"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Class
                </label>
                <select
                  value={addForm.class}
                  onChange={(e) => setAddForm({ ...addForm, class: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                >
                  <option value="Guitar">Guitar</option>
                  <option value="Piano">Piano</option>
                  <option value="Tabla">Tabla</option>
                  <option value="Violin">Violin</option>
                  <option value="Vocals">Vocals</option>
                  <option value="Drums">Drums</option>
                  <option value="Music Theory">Music Theory</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Days
                </label>
                <input
                  required
                  type="text"
                  value={addForm.days}
                  onChange={(e) => setAddForm({ ...addForm, days: e.target.value })}
                  placeholder="e.g. Mon & Wed"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Timing
                </label>
                <input
                  required
                  type="text"
                  value={addForm.timing}
                  onChange={(e) => setAddForm({ ...addForm, timing: e.target.value })}
                  placeholder="e.g. 5:00 PM – 6:00 PM"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Teacher
                </label>
                <input
                  required
                  type="text"
                  value={addForm.teacher}
                  onChange={(e) => setAddForm({ ...addForm, teacher: e.target.value })}
                  placeholder="e.g. Amit Singh"
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
