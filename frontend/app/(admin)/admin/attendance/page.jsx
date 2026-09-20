"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const DEFAULT_ATTENDANCE = [
  { id: "att-1", student: "Aarav Sharma", class: "Guitar", batch: "G-EVE-1", status: "Present", date: "2025-04-28" },
  { id: "att-2", student: "Kabir Khan", class: "Guitar", batch: "G-EVE-1", status: "Present", date: "2025-04-28" },
  { id: "att-3", student: "Diya Patel", class: "Piano", batch: "P-EVE-1", status: "Absent", date: "2025-04-28" },
  { id: "att-4", student: "Meera Nair", class: "Piano", batch: "P-EVE-1", status: "Present", date: "2025-04-28" },
  { id: "att-5", student: "Ishita Rao", class: "Vocals", batch: "V-MOR-1", status: "Present", date: "2025-04-28" },
  { id: "att-6", student: "Rohan Mehta", class: "Tabla", batch: "T-WKD-1", status: "Present", date: "2025-04-28" },
  { id: "att-7", student: "Vivaan Joshi", class: "Drums", batch: "D-EVE-1", status: "Absent", date: "2025-04-28" },
  { id: "att-8", student: "Ananya Singh", class: "Violin", batch: "VN-EVE-1", status: "Present", date: "2025-04-28" },
];

export default function AttendancePage() {
  const [attendance, setAttendance] = useState(DEFAULT_ATTENDANCE);
  const [activeTab, setActiveTab] = useState("today");
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [form, setForm] = useState({
    student: "",
    class: "Guitar",
    batch: "G-EVE-1",
    status: "Present",
    date: new Date().toISOString().split("T")[0],
  });

  const [editForm, setEditForm] = useState({
    student: "",
    class: "Guitar",
    batch: "G-EVE-1",
    status: "Present",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    async function loadAttendance() {
      try {
        const res = await api.get("/attendance", { auth: true });
        if (res && Array.isArray(res) && res.length > 0) {
          const mapped = res.map((rec) => ({
            id: rec.id,
            student: rec.student?.name || "Student",
            class: rec.student?.class?.name || "Music Course",
            batch: rec.student?.batch?.name || "Standard Batch",
            status: rec.status === "PRESENT" ? "Present" : "Absent",
            date: rec.date ? rec.date.split("T")[0] : "2025-04-28",
          }));
          setAttendance(mapped);
        }
      } catch (err) {
        console.warn("Using template attendance data:", err.message);
      }
    }
    loadAttendance();
  }, []);

  async function toggleStatus(id) {
    const target = attendance.find((item) => item.id === id);
    if (!target) return;
    const nextStatus = target.status === "Present" ? "Absent" : "Present";

    setAttendance((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );

    if (!id.startsWith("att-")) {
      try {
        await api.post(
          "/attendance",
          {
            studentId: id,
            date: target.date,
            status: nextStatus.toUpperCase(),
          },
          { auth: true }
        );
      } catch (err) {
        console.warn("Attendance sync error:", err.message);
      }
    }
  }

  function handleAddAttendance(e) {
    e.preventDefault();
    if (!form.student.trim()) return;

    const newRecord = {
      id: `att-${Date.now()}`,
      student: form.student,
      class: form.class,
      batch: form.batch,
      status: form.status,
      date: form.date,
    };

    // Prepend new record to top!
    setAttendance([newRecord, ...attendance]);
    setShowModal(false);
    setForm({
      student: "",
      class: "Guitar",
      batch: "G-EVE-1",
      status: "Present",
      date: new Date().toISOString().split("T")[0],
    });
  }

  function handleOpenEdit(rec) {
    setEditingRecord(rec);
    setEditForm({
      student: rec.student,
      class: rec.class,
      batch: rec.batch,
      status: rec.status,
      date: rec.date,
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingRecord) return;

    setAttendance((prev) =>
      prev.map((item) =>
        item.id === editingRecord.id
          ? {
              ...item,
              student: editForm.student,
              class: editForm.class,
              batch: editForm.batch,
              status: editForm.status,
              date: editForm.date,
            }
          : item
      )
    );
    setEditingRecord(null);
  }

  function handleDeleteAttendance(id, student) {
    if (!confirm(`Are you sure you want to delete attendance record for ${student}?`)) return;
    setAttendance((prev) => prev.filter((item) => item.id !== id));
  }

  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const absentCount = attendance.filter((a) => a.status === "Absent").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Attendance
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Mark and review daily attendance
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-[#E11D48] hover:bg-[#BE123C] px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          Mark Attendance
        </button>
      </div>

      {/* Date Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("today")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "today"
              ? "bg-[#18181B] text-white shadow-xs"
              : "bg-white text-gray-700 border border-[#F3E2EC] hover:bg-[#FBEBF3]"
          }`}
        >
          Today – 28 Apr
        </button>
        <button
          onClick={() => setActiveTab("week")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "week"
              ? "bg-[#18181B] text-white shadow-xs"
              : "bg-white text-gray-700 border border-[#F3E2EC] hover:bg-[#FBEBF3]"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setActiveTab("month")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "month"
              ? "bg-[#18181B] text-white shadow-xs"
              : "bg-white text-gray-700 border border-[#F3E2EC] hover:bg-[#FBEBF3]"
          }`}
        >
          This Month
        </button>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-[#F3E2EC] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg font-bold text-gray-900">
            Today&apos;s Attendance
          </h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-[#E8F8EE] px-3 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]"></span>
              {presentCount} Present
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-[#E11D48] bg-[#FFE4E6] px-3 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E11D48]"></span>
              {absentCount} Absent
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="rounded-xl bg-[#FDEEF5] text-xs font-semibold text-gray-600">
                <th className="rounded-l-xl px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Class</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Batch</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                <th className="rounded-r-xl px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9EBF2] text-sm">
              {attendance.map((row) => (
                <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-800">
                    {row.student}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{row.class}</td>
                  <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{row.batch}</td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => toggleStatus(row.id)}
                      title="Click to toggle status"
                      className={`inline-flex items-center justify-center rounded-full px-3.5 py-0.5 text-xs font-medium transition-transform hover:scale-105 cursor-pointer ${
                        row.status === "Present"
                          ? "bg-[#E8F8EE] text-[#16A34A]"
                          : "bg-[#FFE4E6] text-[#E11D48]"
                      }`}
                    >
                      {row.status}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {/* 1. Edit Attendance */}
                      <button
                        onClick={() => handleOpenEdit(row)}
                        title="Edit Attendance"
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>

                      {/* 2. Delete Attendance */}
                      <button
                        onClick={() => handleDeleteAttendance(row.id, row.student)}
                        title="Delete Record"
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

      {/* Mark Attendance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Mark Attendance
            </h3>
            <form onSubmit={handleAddAttendance} className="space-y-4">
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
                    Batch Code
                  </label>
                  <input
                    type="text"
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                    placeholder="e.g. G-EVE-1"
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white font-medium"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Attendance Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Edit Attendance Record
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
                    Batch Code
                  </label>
                  <input
                    type="text"
                    value={editForm.batch}
                    onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white font-medium"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F3E2EC]">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
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
    </div>
  );
}
