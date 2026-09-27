"use client";

import { useState, useEffect } from "react";
import {
  apiGetAttendance,
  apiMarkAttendance,
  apiMarkBulkAttendance,
} from "@/Api/admin/attendanceApi";
import { apiGetClasses } from "@/Api/admin/classApi";
import { apiGetBatches } from "@/Api/admin/batchApi";
import { apiGetEnrollments } from "@/Api/admin/enrollmentApi";

// A dropdown button that opens a searchable checkbox list with a "Select
// All" option — lets the admin bulk-select many students instead of picking
// one at a time from a native <select>, which doesn't scale to 100+ students.
function StudentMultiSelectDropdown({ students, selectedIds, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selectedIds.includes(s.id));

  function toggle(id) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  }

  function toggleSelectAll() {
    const filteredIds = filtered.map((s) => s.id);
    if (allFilteredSelected) {
      onChange(selectedIds.filter((id) => !filteredIds.includes(id)));
    } else {
      onChange([...new Set([...selectedIds, ...filteredIds])]);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="w-full flex items-center justify-between rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm text-left focus:outline-none focus:border-[#E11D48] bg-white disabled:bg-gray-50 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
      >
        <span className={selectedIds.length ? "text-gray-800" : "text-gray-400"}>
          {selectedIds.length
            ? `${selectedIds.length} student${selectedIds.length > 1 ? "s" : ""} selected`
            : "Select student(s)"}
        </span>
        <svg className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && !disabled && (
        <div className="mt-1 w-full rounded-xl border border-[#F3E2EC] bg-white shadow-sm p-2">
          <input
            type="text"
            autoFocus
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#F3E2EC] px-2.5 py-1.5 text-sm mb-2 focus:outline-none focus:border-[#E11D48]"
          />

          <div className="max-h-40 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 px-2 py-1.5">No students found.</p>
            ) : (
              <>
                <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-semibold text-gray-800 border-b border-gray-100 mb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-[#E11D48] focus:ring-[#E11D48]/30"
                  />
                  Select All{search && ` (${filtered.length} matching)`}
                </label>
                {filtered.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-[#FFF7FB] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s.id)}
                      onChange={() => toggle(s.id)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-[#E11D48] focus:ring-[#E11D48]/30"
                    />
                    {s.name}
                  </label>
                ))}
              </>
            )}
          </div>

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

const STATUS_ORDER = ["Present", "Absent", "Late"];

const STATUS_STYLES = {
  Present: "bg-[#E8F8EE] text-[#16A34A]",
  Absent: "bg-[#FFE4E6] text-[#E11D48]",
  Late: "bg-[#FEF3C7] text-[#B45309]",
};

const DOT_STYLES = {
  Present: "bg-[#16A34A]",
  Absent: "bg-[#E11D48]",
  Late: "bg-[#B45309]",
};

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function mapStatusFromApi(status) {
  if (status === "PRESENT") return "Present";
  if (status === "LATE") return "Late";
  return "Absent";
}

const DEFAULT_ADD_FORM = {
  classId: "",
  batchId: "",
  studentIds: [],
  status: "Present",
  date: todayISO(),
};

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState("today");
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [classes, setClasses] = useState([]);

  const [form, setForm] = useState(DEFAULT_ADD_FORM);
  const [modalBatches, setModalBatches] = useState([]);
  const [modalStudents, setModalStudents] = useState([]);

  const [editForm, setEditForm] = useState({
    status: "Present",
    date: todayISO(),
  });

  useEffect(() => {
    apiGetClasses().then((res) => {
      if (Array.isArray(res)) setClasses(res);
    });
  }, []);

  useEffect(() => {
    loadAttendance(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function loadAttendance(tab) {
    const params = {};
    if (tab === "today") {
      params.date = todayISO();
    } else if (tab === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      params.from = weekAgo.toISOString().split("T")[0];
      params.to = todayISO();
    } else if (tab === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      params.from = monthAgo.toISOString().split("T")[0];
      params.to = todayISO();
    }
    // Scoped to the selected period server-side instead of fetching the
    // entire attendance history and filtering it here.
    const res = await apiGetAttendance(params);
    if (!Array.isArray(res)) return;

    const mapped = res.map((rec) => ({
      id: rec.id,
      enrollmentId: rec.enrollment?.id,
      student: rec.enrollment?.student?.name || "Student",
      class: rec.enrollment?.class?.name || "—",
      batch: rec.enrollment?.batch?.name || "—",
      status: mapStatusFromApi(rec.status),
      date: rec.date ? rec.date.split("T")[0] : todayISO(),
    }));
    setAttendance(mapped);
  }

  async function toggleStatus(id) {
    const target = attendance.find((item) => item.id === id);
    if (!target || !target.enrollmentId) return;

    const nextStatus =
      STATUS_ORDER[(STATUS_ORDER.indexOf(target.status) + 1) % STATUS_ORDER.length];

    const result = await apiMarkAttendance(
      target.enrollmentId,
      target.date,
      nextStatus.toUpperCase()
    );

    if (result) {
      setAttendance((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
      );
    }
  }

  function resetAddForm() {
    setForm(DEFAULT_ADD_FORM);
    setModalBatches([]);
    setModalStudents([]);
  }

  async function handleClassChange(classId) {
    setForm((f) => ({ ...f, classId, batchId: "", studentIds: [] }));
    setModalStudents([]);
    if (!classId) {
      setModalBatches([]);
      return;
    }
    const res = await apiGetBatches(classId);
    setModalBatches(Array.isArray(res) ? res : []);
  }

  async function handleBatchChange(batchId) {
    setForm((f) => ({ ...f, batchId, studentIds: [] }));
    if (!batchId) {
      setModalStudents([]);
      return;
    }
    const res = await apiGetEnrollments({ batchId, active: true });
    // StudentMultiSelectDropdown just needs {id, name} — the "id" here is
    // the enrollmentId, since that's what attendance actually keys on.
    setModalStudents(
      Array.isArray(res) ? res.map((e) => ({ id: e.id, name: e.student?.name || "Student" })) : []
    );
  }

  async function handleAddAttendance(e) {
    e.preventDefault();
    if (form.studentIds.length === 0 || !form.date) return;

    const records = form.studentIds.map((id) => ({
      enrollmentId: id,
      status: form.status.toUpperCase(),
    }));

    const result = await apiMarkBulkAttendance(form.date, records);

    if (result) {
      setShowModal(false);
      resetAddForm();
      loadAttendance(activeTab);
    }
  }

  function handleOpenEdit(rec) {
    setEditingRecord(rec);
    setEditForm({
      status: rec.status,
      date: rec.date,
    });
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingRecord || !editingRecord.enrollmentId) return;

    const result = await apiMarkAttendance(
      editingRecord.enrollmentId,
      editForm.date,
      editForm.status.toUpperCase()
    );

    if (result) {
      setEditingRecord(null);
      loadAttendance(activeTab);
    }
  }

  function handleDeleteAttendance(id, student) {
    if (!confirm(`Are you sure you want to delete attendance record for ${student}?`)) return;
    // No backend delete endpoint exists for attendance records — this only
    // removes the row from the current view; it will reappear on next reload.
    setAttendance((prev) => prev.filter((item) => item.id !== id));
  }

  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const absentCount = attendance.filter((a) => a.status === "Absent").length;
  const lateCount = attendance.filter((a) => a.status === "Late").length;

  const tabTitles = {
    today: "Today's Attendance",
    week: "This Week's Attendance",
    month: "This Month's Attendance",
  };

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

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
          onClick={() => {
            resetAddForm();
            setShowModal(true);
          }}
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
          Today – {todayLabel}
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
        <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-lg font-bold text-gray-900 whitespace-nowrap">
            {tabTitles[activeTab]}
          </h2>
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-[#E8F8EE] px-3 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]"></span>
              {presentCount} Present
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-[#B45309] bg-[#FEF3C7] px-3 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B45309]"></span>
              {lateCount} Late
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
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gray-400">
                    No attendance records for this period.
                  </td>
                </tr>
              ) : (
                attendance.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-800">
                      {row.student}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{row.class}</td>
                    <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{row.batch}</td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => toggleStatus(row.id)}
                        title="Click to cycle status (Present → Absent → Late)"
                        className={`inline-flex items-center justify-center rounded-full px-3.5 py-0.5 text-xs font-medium transition-transform hover:scale-105 cursor-pointer ${STATUS_STYLES[row.status]}`}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md h-[min(620px,85vh)] rounded-2xl bg-white shadow-xl border border-[#F3E2EC] flex flex-col overflow-hidden">
            <form onSubmit={handleAddAttendance} className="flex flex-col flex-1 min-h-0">
              <h3 className="font-serif text-xl font-bold text-gray-900 px-6 pt-6 pb-4 shrink-0">
                Mark Attendance
              </h3>
              <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    required
                    value={form.classId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                  >
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Batch
                  </label>
                  <select
                    required
                    value={form.batchId}
                    onChange={(e) => handleBatchChange(e.target.value)}
                    disabled={!form.classId}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">Select batch</option>
                    {modalBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Student(s)
                </label>
                <StudentMultiSelectDropdown
                  students={modalStudents}
                  selectedIds={form.studentIds}
                  onChange={(ids) => setForm({ ...form, studentIds: ids })}
                  disabled={!form.batchId}
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Check &quot;Select All&quot; to mark the whole batch at once.
                </p>
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
                    <option value="Late">Late</option>
                  </select>
                </div>
              </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 pt-3 border-t border-[#F3E2EC] shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetAddForm();
                  }}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={form.studentIds.length === 0}
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Record{form.studentIds.length > 1 ? "s" : ""}
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
                  Student
                </label>
                <input
                  disabled
                  type="text"
                  value={editingRecord.student}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm bg-gray-50 text-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Class
                  </label>
                  <input
                    disabled
                    type="text"
                    value={editingRecord.class}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Batch
                  </label>
                  <input
                    disabled
                    type="text"
                    value={editingRecord.batch}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm bg-gray-50 text-gray-500"
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
                    <option value="Late">Late</option>
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
