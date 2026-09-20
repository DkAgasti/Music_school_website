"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const DEFAULT_ADMISSIONS = [
  { id: "adm-1", name: "Aarav Sharma", class: "Guitar", date: "28 Apr 2025", status: "Approved", payment: "₹2,000", email: "aarav@example.com", phone: "+91 98765 43210" },
  { id: "adm-2", name: "Diya Patel", class: "Piano", date: "27 Apr 2025", status: "Pending", payment: "₹2,500", email: "diya@example.com", phone: "+91 98765 43211" },
  { id: "adm-3", name: "Rohan Mehta", class: "Tabla", date: "26 Apr 2025", status: "Approved", payment: "₹1,800", email: "rohan@example.com", phone: "+91 98765 43212" },
  { id: "adm-4", name: "Ananya Singh", class: "Violin", date: "25 Apr 2025", status: "Approved", payment: "₹1,500", email: "ananya@example.com", phone: "+91 98765 43213" },
  { id: "adm-5", name: "Kabir Khan", class: "Guitar", date: "24 Apr 2025", status: "Waitlisted", payment: "₹2,000", email: "kabir@example.com", phone: "+91 98765 43214" },
  { id: "adm-6", name: "Ishita Rao", class: "Vocals", date: "23 Apr 2025", status: "Approved", payment: "₹2,000", email: "ishita@example.com", phone: "+91 98765 43215" },
  { id: "adm-7", name: "Vivaan Joshi", class: "Drums", date: "22 Apr 2025", status: "Pending", payment: "₹2,500", email: "vivaan@example.com", phone: "+91 98765 43216" },
  { id: "adm-8", name: "Meera Nair", class: "Piano", date: "21 Apr 2025", status: "Approved", payment: "₹2,500", email: "meera@example.com", phone: "+91 98765 43217" },
];

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState(DEFAULT_ADMISSIONS);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [viewingAdmission, setViewingAdmission] = useState(null);
  const [editingAdmission, setEditingAdmission] = useState(null);

  const [form, setForm] = useState({
    studentName: "",
    class: "Guitar",
    email: "",
    phone: "",
    payment: "₹2,000",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    class: "Guitar",
    email: "",
    phone: "",
    payment: "₹2,000",
    status: "Approved",
  });

  useEffect(() => {
    async function loadAdmissions() {
      try {
        const res = await api.get("/admissions", { auth: true });
        if (res && Array.isArray(res) && res.length > 0) {
          const mapped = res.map((item) => ({
            id: item.id,
            name: item.studentName || item.student?.name || "Student",
            class: item.class?.name || "Guitar",
            date: new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            status: item.status === "APPROVED" ? "Approved" : item.status === "PENDING" ? "Pending" : "Waitlisted",
            payment: item.payment?.amount ? `₹${Math.round(item.payment.amount / 100).toLocaleString("en-IN")}` : "₹2,000",
            email: item.email || item.student?.email || "—",
            phone: item.phone || item.student?.phone || "—",
          }));
          setAdmissions(mapped);
        }
      } catch (err) {
        console.warn("Using template admissions:", err.message);
      }
    }
    loadAdmissions();
  }, []);

  const filteredAdmissions = admissions.filter((item) => {
    if (statusFilter === "All") return true;
    return item.status.toLowerCase() === statusFilter.toLowerCase();
  });

  function exportCSV() {
    const headers = ["Student Name", "Class", "Date", "Status", "Payment", "Email", "Phone"];
    const rows = filteredAdmissions.map((r) => [r.name, r.class, r.date, r.status, r.payment, r.email, r.phone || ""]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admissions_${statusFilter.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleAddAdmission(e) {
    e.preventDefault();
    const newEntry = {
      id: `adm-${Date.now()}`,
      name: form.studentName,
      class: form.class,
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      status: "Approved",
      payment: form.payment.startsWith("₹") ? form.payment : `₹${form.payment}`,
      email: form.email,
      phone: form.phone || "—",
    };
    // Always prepend new admission to the top!
    setAdmissions([newEntry, ...admissions]);
    setShowModal(false);
    setForm({ studentName: "", class: "Guitar", email: "", phone: "", payment: "₹2,000" });
  }

  function handleOpenEdit(row) {
    setEditingAdmission(row);
    setEditForm({
      name: row.name,
      class: row.class,
      email: row.email,
      phone: row.phone || "",
      payment: row.payment,
      status: row.status,
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingAdmission) return;
    setAdmissions((prev) =>
      prev.map((item) =>
        item.id === editingAdmission.id
          ? {
              ...item,
              name: editForm.name,
              class: editForm.class,
              email: editForm.email,
              phone: editForm.phone || "—",
              payment: editForm.payment.startsWith("₹") ? editForm.payment : `₹${editForm.payment}`,
              status: editForm.status,
            }
          : item
      )
    );
    setEditingAdmission(null);
  }

  function handleDeleteAdmission(id, name) {
    if (!confirm(`Are you sure you want to delete application for ${name}?`)) return;
    setAdmissions((prev) => prev.filter((item) => item.id !== id));
  }

  function handleToggleStatus(id) {
    setAdmissions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = item.status === "Approved" ? "Waitlisted" : item.status === "Waitlisted" ? "Pending" : "Approved";
          return { ...item, status: next };
        }
        return item;
      })
    );
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
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-[#BE123C] transition-colors cursor-pointer self-start sm:self-auto"
        >
          New Admission
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["All", "Approved", "Pending", "Waitlisted"].map((filter) => {
          const isActive = statusFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
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
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                    No applications found matching {statusFilter}.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-800">
                      {row.name}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{row.class}</td>
                    <td className="px-4 py-3.5 text-gray-500">{row.date}</td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleStatus(row.id)}
                        title="Click to toggle status"
                        className="cursor-pointer transition-transform hover:scale-105"
                      >
                        {renderStatusBadge(row.status)}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-gray-800">
                      {row.payment}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* 1. View Icon */}
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

                        {/* 2. Edit Icon */}
                        <button
                          onClick={() => handleOpenEdit(row)}
                          title="Edit Admission"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {/* 3. Delete Icon */}
                        <button
                          onClick={() => handleDeleteAdmission(row.id, row.name)}
                          title="Delete Admission"
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

      {/* New Admission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
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
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Payment Amount
                </label>
                <input
                  type="text"
                  value={form.payment}
                  onChange={(e) => setForm({ ...form, payment: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
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

      {/* Edit Admission Modal */}
      {editingAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Edit Admission Details
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Waitlisted">Waitlisted</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Payment
                </label>
                <input
                  type="text"
                  value={editForm.payment}
                  onChange={(e) => setEditForm({ ...editForm, payment: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingAdmission(null)}
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

      {/* View Admission Modal */}
      {viewingAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <div className="flex items-center justify-between border-b border-[#F3E2EC] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#FDEEF5] text-[#E11D48] flex items-center justify-center font-bold text-base border border-[#F9EBF2]">
                  {viewingAdmission.name.charAt(0)}
                </div>
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

            <div className="flex items-center justify-between pt-5 mt-5 border-t border-[#F3E2EC]">
              <button
                onClick={() => {
                  handleToggleStatus(viewingAdmission.id);
                  setViewingAdmission((prev) => {
                    const next = prev.status === "Approved" ? "Waitlisted" : prev.status === "Waitlisted" ? "Pending" : "Approved";
                    return { ...prev, status: next };
                  });
                }}
                className="text-xs font-semibold text-[#E11D48] hover:underline cursor-pointer"
              >
                Toggle Status ({viewingAdmission.status})
              </button>
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
