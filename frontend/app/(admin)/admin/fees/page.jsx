"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const DEFAULT_FEE_ROWS = [
  { id: "fee-1", student: "Aarav Sharma", class: "Guitar, Piano", fee: "₹3,000", dueDate: "01 May 2025", status: "Paid", receiptNo: "REC-2025-0101", paidDate: "25 Apr 2025", mode: "Online UPI" },
  { id: "fee-2", student: "Diya Patel", class: "Piano", fee: "₹2,500", dueDate: "01 May 2025", status: "Paid", receiptNo: "REC-2025-0102", paidDate: "26 Apr 2025", mode: "Credit Card" },
  { id: "fee-3", student: "Rohan Mehta", class: "Tabla", fee: "₹2,000", dueDate: "01 May 2025", status: "Pending", receiptNo: "—", paidDate: "—", mode: "—" },
  { id: "fee-4", student: "Ananya Singh", class: "Violin", fee: "₹2,500", dueDate: "01 May 2025", status: "Paid", receiptNo: "REC-2025-0103", paidDate: "22 Apr 2025", mode: "Cash" },
  { id: "fee-5", student: "Ishita Rao", class: "Vocals", fee: "₹2,000", dueDate: "01 May 2025", status: "Pending", receiptNo: "—", paidDate: "—", mode: "—" },
  { id: "fee-6", student: "Vivaan Joshi", class: "Drums", fee: "₹2,500", dueDate: "01 May 2025", status: "Pending", receiptNo: "—", paidDate: "—", mode: "—" },
  { id: "fee-7", student: "Meera Nair", class: "Piano", fee: "₹2,500", dueDate: "01 May 2025", status: "Paid", receiptNo: "REC-2025-0104", paidDate: "27 Apr 2025", mode: "Net Banking" },
  { id: "fee-8", student: "Kabir Khan", class: "Guitar", fee: "₹2,000", dueDate: "01 May 2025", status: "Pending", receiptNo: "—", paidDate: "—", mode: "—" },
  { id: "fee-9", student: "Tanvi Shah", class: "Vocals", fee: "₹2,000", dueDate: "01 May 2025", status: "Paid", receiptNo: "REC-2025-0105", paidDate: "20 Apr 2025", mode: "Online UPI" },
  { id: "fee-10", student: "Kunal Puri", class: "Violin", fee: "₹2,500", dueDate: "01 May 2025", status: "Paid", receiptNo: "REC-2025-0106", paidDate: "24 Apr 2025", mode: "Cash" },
];

export default function FeesPage() {
  const [feeRows, setFeeRows] = useState(DEFAULT_FEE_ROWS);
  const [filter, setFilter] = useState("All");
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [editingFee, setEditingFee] = useState(null);

  const [collectForm, setCollectForm] = useState({
    student: "",
    class: "Guitar",
    fee: "₹2,500",
    dueDate: "01 May 2025",
    status: "Paid",
    mode: "Cash",
  });

  const [editForm, setEditForm] = useState({
    student: "",
    class: "Guitar",
    fee: "₹2,500",
    dueDate: "01 May 2025",
    status: "Paid",
    mode: "Cash",
  });

  const [stats, setStats] = useState({
    collected: "₹48,500",
    pendingDues: "₹6,500",
    pendingCount: 4,
  });

  useEffect(() => {
    async function loadFeeStatus() {
      try {
        const res = await api.get("/admin/fee-status", { auth: true });
        if (res && res.students && res.students.length > 0) {
          const mapped = res.students.map((s, idx) => ({
            id: s.studentId,
            student: s.studentName,
            class: s.className,
            fee: `₹${s.feeRupees?.toLocaleString("en-IN") || "2,500"}`,
            dueDate: s.dueDate || "01 May 2025",
            status: s.status,
            receiptNo: s.status === "Paid" ? `REC-2025-0${100 + idx}` : "—",
            paidDate: s.status === "Paid" ? "26 Apr 2025" : "—",
            mode: s.status === "Paid" ? "Online UPI" : "—",
          }));
          setFeeRows(mapped);
          setStats({
            collected: `₹${(res.collectedThisMonthRupees || 48500).toLocaleString("en-IN")}`,
            pendingDues: `₹${(res.pendingDuesRupees || 6500).toLocaleString("en-IN")}`,
            pendingCount: res.studentsPendingCount ?? 4,
          });
        }
      } catch (err) {
        console.warn("Using template fee data:", err.message);
      }
    }
    loadFeeStatus();
  }, []);

  function handleCollectFee(e) {
    e.preventDefault();
    const newFee = {
      id: `fee-${Date.now()}`,
      student: collectForm.student,
      class: collectForm.class,
      fee: collectForm.fee.startsWith("₹") ? collectForm.fee : `₹${collectForm.fee}`,
      dueDate: collectForm.dueDate,
      status: collectForm.status,
      receiptNo: collectForm.status === "Paid" ? `REC-2025-${Math.floor(1000 + Math.random() * 9000)}` : "—",
      paidDate: collectForm.status === "Paid" ? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
      mode: collectForm.mode,
    };

    // Prepend new fee record to the top!
    setFeeRows([newFee, ...feeRows]);
    setShowCollectModal(false);
    setCollectForm({ student: "", class: "Guitar", fee: "₹2,500", dueDate: "01 May 2025", status: "Paid", mode: "Cash" });
  }

  function handleOpenEdit(row) {
    setEditingFee(row);
    setEditForm({
      student: row.student,
      class: row.class,
      fee: row.fee.replace("₹", "").trim(),
      dueDate: row.dueDate,
      status: row.status,
      mode: row.mode !== "—" ? row.mode : "Cash",
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingFee) return;

    const cleanFee = editForm.fee.startsWith("₹") ? editForm.fee : `₹${editForm.fee}`;
    setFeeRows((prev) =>
      prev.map((item) =>
        item.id === editingFee.id
          ? {
              ...item,
              student: editForm.student,
              class: editForm.class,
              fee: cleanFee,
              dueDate: editForm.dueDate,
              status: editForm.status,
              mode: editForm.status === "Paid" ? editForm.mode : "—",
              receiptNo: editForm.status === "Paid" && item.receiptNo === "—" ? `REC-2025-${Math.floor(1000 + Math.random() * 9000)}` : item.receiptNo,
              paidDate: editForm.status === "Paid" && item.paidDate === "—" ? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : item.paidDate,
            }
          : item
      )
    );
    setEditingFee(null);
  }

  function handleMarkAsPaid(id) {
    setFeeRows((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isNowPaid = item.status !== "Paid";
          return {
            ...item,
            status: isNowPaid ? "Paid" : "Pending",
            receiptNo: isNowPaid ? `REC-2025-${Math.floor(1000 + Math.random() * 9000)}` : "—",
            paidDate: isNowPaid ? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
            mode: isNowPaid ? "Cash" : "—",
          };
        }
        return item;
      })
    );
  }

  function handleDeleteFee(id, student) {
    if (!confirm(`Are you sure you want to remove fee record for ${student}?`)) return;
    setFeeRows((prev) => prev.filter((item) => item.id !== id));
  }

  const filteredRows = feeRows.filter((r) => {
    if (filter === "All") return true;
    return r.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Fees &amp; Payments
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            See who has paid this month and who is pending
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCollectModal(true)}
            className="inline-flex items-center justify-center rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-[#BE123C] transition-colors cursor-pointer"
          >
            Record Payment
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-[#F3E2EC] bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Collected This Month</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">
            {stats.collected}
          </p>
        </div>

        <div className="rounded-2xl border border-[#F3E2EC] bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Pending Dues</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {stats.pendingDues}
          </p>
        </div>

        <div className="rounded-2xl border border-[#F3E2EC] bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Students Pending</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-[#E11D48] tracking-tight">
            {stats.pendingCount}
          </p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["All", "Paid", "Pending"].map((f) => {
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "bg-white text-gray-700 border border-[#F3E2EC] hover:bg-[#FBEBF3]"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-[#F3E2EC] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg font-bold text-gray-900">
            Monthly Fee Status – May 2025
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            {filteredRows.length} Students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="rounded-xl bg-[#FDEEF5] text-xs font-semibold text-gray-600">
                <th className="rounded-l-xl px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Class</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Fee</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Due Date</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                <th className="rounded-r-xl px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9EBF2] text-sm">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                    No fee records found for {filter}.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-800">
                      {row.student}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{row.class}</td>
                    <td className="px-4 py-3.5 font-bold text-gray-900">{row.fee}</td>
                    <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{row.dueDate}</td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleMarkAsPaid(row.id)}
                        title="Click to toggle Paid/Pending"
                        className="cursor-pointer transition-transform hover:scale-105"
                      >
                        {row.status === "Paid" ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-[#E8F8EE] px-3.5 py-0.5 text-xs font-medium text-[#16A34A]">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center rounded-full bg-[#FEF3E2] px-3.5 py-0.5 text-xs font-medium text-[#D97706]">
                            Pending
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* If Paid: View Receipt */}
                        {row.status === "Paid" && (
                          <button
                            onClick={() => setViewingReceipt(row)}
                            title="View Payment Receipt"
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}

                        {/* If Pending: Mark as Paid quick button */}
                        {row.status !== "Paid" && (
                          <button
                            onClick={() => handleMarkAsPaid(row.id)}
                            title="Mark as Paid"
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}

                        {/* Edit Record */}
                        <button
                          onClick={() => handleOpenEdit(row)}
                          title="Edit Fee Record"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {/* Delete Record */}
                        <button
                          onClick={() => handleDeleteFee(row.id, row.student)}
                          title="Delete Fee Record"
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

      {/* Record / Collect Payment Modal */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Record Student Fee
            </h3>
            <form onSubmit={handleCollectFee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  required
                  type="text"
                  value={collectForm.student}
                  onChange={(e) => setCollectForm({ ...collectForm, student: e.target.value })}
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
                    value={collectForm.class}
                    onChange={(e) => setCollectForm({ ...collectForm, class: e.target.value })}
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
                    Amount (₹)
                  </label>
                  <input
                    required
                    type="text"
                    value={collectForm.fee}
                    onChange={(e) => setCollectForm({ ...collectForm, fee: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={collectForm.status}
                    onChange={(e) => setCollectForm({ ...collectForm, status: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={collectForm.mode}
                    onChange={(e) => setCollectForm({ ...collectForm, mode: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online UPI">Online UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="text"
                  value={collectForm.dueDate}
                  onChange={(e) => setCollectForm({ ...collectForm, dueDate: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
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

      {/* Edit Fee Modal */}
      {editingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Edit Fee Record
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
                  <input
                    type="text"
                    value={editForm.class}
                    onChange={(e) => setEditForm({ ...editForm, class: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    required
                    type="text"
                    value={editForm.fee}
                    onChange={(e) => setEditForm({ ...editForm, fee: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={editForm.mode}
                    onChange={(e) => setEditForm({ ...editForm, mode: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online UPI">Online UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="text"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingFee(null)}
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

      {/* View Payment Receipt Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <div className="text-center pb-4 border-b border-[#F3E2EC]">
              <div className="h-12 w-12 rounded-full bg-[#E8F8EE] text-[#16A34A] flex items-center justify-center mx-auto mb-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Payment Receipt
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Receipt #{viewingReceipt.receiptNo}
              </p>
            </div>

            <div className="space-y-3 py-4 text-xs border-b border-[#F3E2EC]">
              <div className="flex justify-between">
                <span className="text-gray-500">Student Name</span>
                <span className="font-bold text-gray-800">{viewingReceipt.student}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Enrolled Course</span>
                <span className="font-medium text-gray-800">{viewingReceipt.class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Billing Period</span>
                <span className="font-medium text-gray-800">May 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Mode</span>
                <span className="font-medium text-gray-800">{viewingReceipt.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Date</span>
                <span className="font-medium text-gray-800">{viewingReceipt.paidDate}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-dashed border-[#F3E2EC] text-sm">
                <span className="font-bold text-gray-900">Amount Paid</span>
                <span className="font-bold text-emerald-600 text-base">{viewingReceipt.fee}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => window.print()}
                className="rounded-xl border border-[#F3E2EC] px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setViewingReceipt(null)}
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
