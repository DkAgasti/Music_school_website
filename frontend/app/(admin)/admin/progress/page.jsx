"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const DEFAULT_PROGRESS_NOTES = [
  {
    id: "prog-1",
    student: "Aarav Sharma",
    class: "Guitar",
    rating: 5,
    note: "Improved chord transitions and rhythm. Ready to start Grade 2 repertoire.",
    updated: "Apr 10, 2025",
  },
  {
    id: "prog-2",
    student: "Aarav Sharma",
    class: "Piano",
    rating: 4,
    note: "Good progress in both hands coordination. Keep practicing arpeggios.",
    updated: "Apr 5, 2025",
  },
  {
    id: "prog-3",
    student: "Diya Patel",
    class: "Piano",
    rating: 4,
    note: "Needs practice on tempo consistency with metronome on allegro pieces.",
    updated: "Apr 8, 2025",
  },
  {
    id: "prog-4",
    student: "Rohan Mehta",
    class: "Tabla",
    rating: 5,
    note: "Excellent grip on teentaal patterns and kaydas. High level of dedication.",
    updated: "Apr 9, 2025",
  },
  {
    id: "prog-5",
    student: "Ishita Rao",
    class: "Vocals",
    rating: 4,
    note: "Breath control improving steadily. Pitch accuracy during taan is consistent.",
    updated: "Apr 7, 2025",
  },
  {
    id: "prog-6",
    student: "Ananya Singh",
    class: "Violin",
    rating: 5,
    note: "Bowing technique much smoother now. Tone clarity has significantly advanced.",
    updated: "Apr 6, 2025",
  },
];

export default function ProgressTrackerPage() {
  const [notes, setNotes] = useState(DEFAULT_PROGRESS_NOTES);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);

  const [form, setForm] = useState({
    student: "",
    class: "Guitar",
    note: "",
    rating: "5",
  });

  const [editForm, setEditForm] = useState({
    student: "",
    class: "Guitar",
    note: "",
    rating: "5",
  });

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await api.get("/progress");
        if (res && Array.isArray(res) && res.length > 0) {
          const mapped = res.map((item) => ({
            id: item.id,
            student: item.studentName || item.student?.name || "Student",
            class: item.className || item.student?.class?.name || "Course",
            note: item.note,
            rating: item.rating || 5,
            updated: new Date(item.date).toLocaleDateString("en-GB", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          }));
          setNotes(mapped);
        }
      } catch (err) {
        console.warn("Using template progress notes:", err.message);
      }
    }
    loadProgress();
  }, []);

  async function handleAddNote(e) {
    e.preventDefault();
    if (!form.student.trim() || !form.note.trim()) return;

    const newNote = {
      id: `prog-${Date.now()}`,
      student: form.student,
      class: form.class,
      note: form.note,
      rating: parseInt(form.rating, 10),
      updated: new Date().toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }),
    };

    // Prepend new note to the top!
    setNotes([newNote, ...notes]);
    setShowModal(false);
    setForm({
      student: "",
      class: "Guitar",
      note: "",
      rating: "5",
    });

    try {
      await api.post("/progress", {
        studentId: newNote.id,
        note: newNote.note,
        rating: parseInt(form.rating, 10),
      }, { auth: true });
    } catch (err) {
      console.warn("Progress sync note:", err.message);
    }
  }

  function handleOpenEdit(noteItem) {
    setEditingNote(noteItem);
    setEditForm({
      student: noteItem.student,
      class: noteItem.class,
      note: noteItem.note,
      rating: String(noteItem.rating || 5),
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingNote) return;

    setNotes((prev) =>
      prev.map((item) =>
        item.id === editingNote.id
          ? {
              ...item,
              student: editForm.student,
              class: editForm.class,
              note: editForm.note,
              rating: parseInt(editForm.rating, 10),
              updated: new Date().toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }),
            }
          : item
      )
    );
    setEditingNote(null);
  }

  function handleDeleteNote(id, student) {
    if (!confirm(`Are you sure you want to delete this progress note for ${student}?`)) return;
    setNotes((prev) => prev.filter((item) => item.id !== id));
  }

  const filteredNotes = notes.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.student.toLowerCase().includes(term) ||
      item.class.toLowerCase().includes(term) ||
      item.note.toLowerCase().includes(term)
    );
  });

  const displayedNotes = showAll ? filteredNotes : filteredNotes.slice(0, 10);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Progress Tracker
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Teacher notes and student progress
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-[#E11D48] hover:bg-[#BE123C] px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          Add Note
        </button>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-[#F3E2EC] bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="font-serif text-lg font-bold text-gray-900">
            Latest Progress Notes
          </h2>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search student or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs rounded-full border border-[#F3E2EC] px-3.5 py-1.5 focus:outline-none focus:border-[#E11D48] bg-white shadow-xs"
            />
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-semibold text-[#E11D48] hover:underline cursor-pointer"
            >
              {showAll ? "Show Less" : "View All"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="rounded-xl bg-[#FDEEF5] text-xs font-semibold text-gray-600">
                <th className="rounded-l-xl px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Class</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Latest Note</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Updated</th>
                <th className="rounded-r-xl px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9EBF2] text-sm">
              {displayedNotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gray-400">
                    No progress notes match your search.
                  </td>
                </tr>
              ) : (
                displayedNotes.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                      {row.student}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{row.class}</td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-md">
                      <p className="line-clamp-2 leading-relaxed">{row.note}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center text-gray-500 text-xs whitespace-nowrap">
                      {row.updated}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* 1. View Icon */}
                        <button
                          onClick={() => setViewingNote(row)}
                          title="View Full Note"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* 2. Edit Icon */}
                        <button
                          onClick={() => handleOpenEdit(row)}
                          title="Edit Note"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {/* 3. Delete Icon */}
                        <button
                          onClick={() => handleDeleteNote(row.id, row.student)}
                          title="Delete Note"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FFE4E6] transition-colors cursor-pointer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Add Progress Note
            </h3>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  required
                  type="text"
                  value={form.student}
                  onChange={(e) => setForm({ ...form, student: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    value={form.class}
                    onChange={(e) => setForm({ ...form, class: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                  >
                    <option value="Guitar">Guitar</option>
                    <option value="Piano">Piano</option>
                    <option value="Tabla">Tabla</option>
                    <option value="Violin">Violin</option>
                    <option value="Vocals">Vocals</option>
                    <option value="Drums">Drums</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Rating (1-5)
                  </label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white font-medium"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                    <option value="4">⭐⭐⭐⭐ (4)</option>
                    <option value="3">⭐⭐⭐ (3)</option>
                    <option value="2">⭐⭐ (2)</option>
                    <option value="1">⭐ (1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Teacher Observation / Note
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="e.g. Completed Grade 2 repertoire. Excellent timing on rhythm exercises."
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F3E2EC]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C] cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Edit Progress Note
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  required
                  type="text"
                  value={editForm.student}
                  onChange={(e) => setEditForm({ ...editForm, student: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    value={editForm.class}
                    onChange={(e) => setEditForm({ ...editForm, class: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                  >
                    <option value="Guitar">Guitar</option>
                    <option value="Piano">Piano</option>
                    <option value="Tabla">Tabla</option>
                    <option value="Violin">Violin</option>
                    <option value="Vocals">Vocals</option>
                    <option value="Drums">Drums</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Rating (1-5)
                  </label>
                  <select
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white font-medium"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                    <option value="4">⭐⭐⭐⭐ (4)</option>
                    <option value="3">⭐⭐⭐ (3)</option>
                    <option value="2">⭐⭐ (2)</option>
                    <option value="1">⭐ (1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Teacher Observation / Note
                </label>
                <textarea
                  required
                  rows={3}
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F3E2EC]">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Full Note Modal */}
      {viewingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <div className="flex items-center justify-between border-b border-[#F3E2EC] pb-4 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  {viewingNote.student}
                </h3>
                <p className="text-xs text-gray-500">{viewingNote.class} • {viewingNote.updated}</p>
              </div>
              <div className="text-sm">
                {"⭐".repeat(viewingNote.rating || 5)}
              </div>
            </div>

            <div className="bg-[#FFF7FB] rounded-xl p-4 border border-[#F9EBF2] mb-5">
              <span className="text-xs text-gray-400 block mb-1 font-semibold uppercase tracking-wider">Teacher Observation</span>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {viewingNote.note}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  handleOpenEdit(viewingNote);
                  setViewingNote(null);
                }}
                className="rounded-xl border border-[#F3E2EC] px-4 py-2 text-xs font-semibold text-gray-700 hover:text-[#E11D48] hover:bg-[#FFF7FB] cursor-pointer"
              >
                Edit Note
              </button>
              <button
                onClick={() => setViewingNote(null)}
                className="rounded-xl bg-[#18181B] px-4 py-2 text-xs font-semibold text-white hover:bg-black cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
