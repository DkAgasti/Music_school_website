"use client";

import { useState, useEffect } from "react";
import { apiGetAdmissions, apiCreateAdmission } from "@/Api/admin/admissionApi";
import { apiGetClasses } from "@/Api/admin/classApi";
import { apiGetBatches } from "@/Api/admin/batchApi";
import { apiGetFeePlans } from "@/Api/admin/feePlanApi";
import StudentAvatar from "@/components/admin/StudentAvatar";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 20;

const STATUS_DISPLAY = {
  PENDING: "Pending",
  APPROVED: "Approved",
  WAITLISTED: "Waitlisted",
  REJECTED: "Rejected",
};

const EMPTY_FORM = {
  studentName: "",
  classId: "",
  batchId: "",
  feePlanId: "",
  email: "",
  phone: "",
  guardianName: "",
  address: "",
};

function formatDate(dateLike) {
  return new Date(dateLike).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRupees(amountInPaise) {
  return `₹${Math.round(amountInPaise / 100).toLocaleString("en-IN")}`;
}

// Maps a raw admission object from the backend (either from GET /admissions
// or the `admission` field returned by POST /admissions) into the row shape
// this page renders. `fallback` fills in details the create response might
// not echo back (e.g. class name / fee amount), sourced from the form the
// admin just submitted.
function mapAdmission(item, fallback = {}) {
  const amountPaise = item.feePlan?.amount ?? item.payment?.amount ?? fallback.amountPaise ?? null;
  return {
    id: item.id,
    name: item.studentName || item.enrollment?.student?.name || "Student",
    photoUrl: item.enrollment?.student?.photoUrl || null,
    class: item.className || item.class?.name || fallback.className || "—",
    date: item.appliedOn || (item.createdAt ? formatDate(item.createdAt) : formatDate(new Date())),
    status: STATUS_DISPLAY[item.status] || "Pending",
    payment: amountPaise != null ? formatRupees(amountPaise) : "—",
    email: item.email || item.enrollment?.student?.email || "—",
    phone: item.phone || item.enrollment?.student?.phone || "—",
  };
}

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [viewingAdmission, setViewingAdmission] = useState(null);

  const [classes, setClasses] = useState([]);
  const [formBatches, setFormBatches] = useState([]);
  const [formFeePlans, setFormFeePlans] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);

  async function loadAdmissions(pageToLoad, filter) {
    setLoading(true);
    const params = { page: pageToLoad, limit: PAGE_SIZE };
    if (filter && filter !== "All") params.status = filter.toUpperCase();
    const res = await apiGetAdmissions(params);
    if (res && Array.isArray(res.items)) {
      setAdmissions(res.items.map((item) => mapAdmission(item)));
      setTotalPages(res.totalPages);
    }
    setLoading(false);
  }

  useEffect(() => {
    async function loadClasses() {
      const res = await apiGetClasses();
      setClasses(Array.isArray(res) ? res : []);
    }
    loadAdmissions(1, "All");
    loadClasses();
  }, []);

  function handleFilterChange(filter) {
    setStatusFilter(filter);
    setPage(1);
    loadAdmissions(1, filter);
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    loadAdmissions(nextPage, statusFilter);
  }

  function exportCSV() {
    const headers = ["Student Name", "Class", "Date", "Status", "Payment", "Email", "Phone"];
    const rows = admissions.map((r) => [r.name, r.class, r.date, r.status, r.payment, r.email, r.phone || ""]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admissions_${statusFilter.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleOpenNewAdmission() {
    setForm(EMPTY_FORM);
    setFormBatches([]);
    setFormFeePlans([]);
    setShowModal(true);
  }

  async function handleClassChange(classId) {
    setForm((f) => ({ ...f, classId, batchId: "", feePlanId: "" }));
    setFormBatches([]);
    setFormFeePlans([]);
    if (!classId) return;
    const [batches, feePlans] = await Promise.all([apiGetBatches(classId), apiGetFeePlans(classId)]);
    setFormBatches(Array.isArray(batches) ? batches : []);
    setFormFeePlans(Array.isArray(feePlans) ? feePlans : []);
  }

  async function handleAddAdmission(e) {
    e.preventDefault();
    const payload = {
      studentName: form.studentName,
      phone: form.phone,
      email: form.email,
      classId: form.classId,
      batchId: form.batchId,
      feePlanId: form.feePlanId,
    };
    if (form.guardianName) payload.guardianName = form.guardianName;
    if (form.address) payload.address = form.address;

    const res = await apiCreateAdmission(payload);
    if (res && res.admission) {
      const selectedClass = classes.find((c) => c.id === form.classId);
      const selectedFeePlan = formFeePlans.find((p) => p.id === form.feePlanId);
      const newRow = mapAdmission(res.admission, {
        className: selectedClass?.name,
        amountPaise: selectedFeePlan?.amount,
      });
      setAdmissions((prev) => [newRow, ...prev]);
      setShowModal(false);
      setForm(EMPTY_FORM);
      setFormBatches([]);
      setFormFeePlans([]);
    }
  }

  function renderStatusBadge(status) {
    if (status === "Approved") {
      return (
        <span className="inline-flex items-center justify-center rounded-full bg-[#E8F8EE] px-3 py-0.5 text-xs font-medium text-[#16A34A]">
          Approved
        </span>
      );
    }
    if (status === "Pending") {
      return (
        <span className="inline-flex items-center justify-center rounded-full bg-[#FEF3E2] px-3 py-0.5 text-xs font-medium text-[#D97706]">
          Pending
        </span>
      );
    }
    if (status === "Rejected") {
      return (
        <span className="inline-flex items-center justify-center rounded-full bg-[#FEE2E2] px-3 py-0.5 text-xs font-medium text-[#B91C1C]">
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-[#FFEDD5] px-3 py-0.5 text-xs font-medium text-[#C2410C]">
        Waitlisted
      </span>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Admissions
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Review and manage admission applications
          </p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["All", "Approved", "Pending", "Waitlisted", "Rejected"].map((filter) => {
          const isActive = statusFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "bg-white text-gray-700 border border-[#F3E2EC] hover:bg-[#FBEBF3]"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-[#F3E2EC] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg font-bold text-gray-900">
            All Applications
          </h2>
          <button
            onClick={exportCSV}
            className="text-xs font-semibold text-[#E11D48] hover:underline cursor-pointer"
          >
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="rounded-xl bg-[#FDEEF5] text-xs font-semibold text-gray-600">
                <th className="rounded-l-xl px-4 py-3 font-semibold text-gray-600">Student Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Class</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Payment</th>
                <th className="rounded-r-xl px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9EBF2] text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                    Loading applications...
                  </td>
                </tr>
              ) : admissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                    No applications found matching {statusFilter}.
                  </td>
                </tr>
              ) : (
                admissions.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-800">
                      <div className="flex items-center gap-2.5">
                        <StudentAvatar name={row.name} photoUrl={row.photoUrl} />
                        {row.name}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{row.class}</td>
                    <td className="px-4 py-3.5 text-gray-500">{row.date}</td>
                    <td className="px-4 py-3.5 text-center">
                      {renderStatusBadge(row.status)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-gray-800">
                      {row.payment}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* View Icon */}
                        <button
                          onClick={() => setViewingAdmission(row)}
                          title="View Application Details"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>

      {/* New Admission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC] max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Add New Admission
            </h3>
            <form onSubmit={handleAddAdmission} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  required
                  type="text"
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
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
                  <option value="" disabled>
                    Select a class
                  </option>
                  {classes
                    .filter((c) => c.active !== false)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Batch
                  </label>
                  <select
                    required
                    disabled={!form.classId}
                    value={form.batchId}
                    onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="" disabled>
                      {form.classId ? "Select batch" : "Select class first"}
                    </option>
                    {formBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.schedule}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Fee Plan
                  </label>
                  <select
                    required
                    disabled={!form.classId}
                    value={form.feePlanId}
                    onChange={(e) => setForm({ ...form, feePlanId: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="" disabled>
                      {form.classId ? "Select plan" : "Select class first"}
                    </option>
                    {formFeePlans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{Math.round(p.amount / 100).toLocaleString("en-IN")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. student@example.com"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Guardian Name <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.guardianName}
                    onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                    placeholder="e.g. Rakesh Sharma"
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Address <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. Mumbai, MH"
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
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
                  Save Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Admission Modal */}
      {viewingAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <div className="flex items-center justify-between border-b border-[#F3E2EC] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <StudentAvatar
                  name={viewingAdmission.name}
                  photoUrl={viewingAdmission.photoUrl}
                  size="h-10 w-10 text-base"
                />
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900">
                    {viewingAdmission.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Application ID: <span className="font-mono">{viewingAdmission.id}</span>
                  </p>
                </div>
              </div>
              <div>{renderStatusBadge(viewingAdmission.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Selected Class</span>
                <span className="text-gray-800 font-semibold text-sm">{viewingAdmission.class}</span>
              </div>
              <div className="bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Date Applied</span>
                <span className="text-gray-800 font-semibold text-sm">{viewingAdmission.date}</span>
              </div>
              <div className="bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Payment Fee</span>
                <span className="text-gray-800 font-semibold text-sm">{viewingAdmission.payment}</span>
              </div>
              <div className="bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Phone Number</span>
                <span className="text-gray-800 font-semibold text-sm">{viewingAdmission.phone || "—"}</span>
              </div>
              <div className="col-span-2 bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Email Address</span>
                <span className="text-gray-800 font-semibold text-sm">{viewingAdmission.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-5 mt-5 border-t border-[#F3E2EC]">
              <button
                onClick={() => setViewingAdmission(null)}
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
