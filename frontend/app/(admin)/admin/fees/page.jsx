"use client";

import { useState, useEffect } from "react";
import { apiGetFeeStatus, apiSendAllFeeReminders } from "@/Api/admin/adminApi";
import { apiGetPayments, apiSendFeeReminder, apiDownloadReceipt } from "@/Api/admin/paymentApi";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 20;

export default function FeesPage() {
  // Real per-student monthly fee data, loaded from GET /api/admin/fee-status.
  const [feeRows, setFeeRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthLabel, setMonthLabel] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState(null);
  const [isSendingAllReminders, setIsSendingAllReminders] = useState(false);

  const [collectForm, setCollectForm] = useState({
    student: "",
    class: "Guitar",
    fee: "₹2,500",
    dueDate: "01 May 2025",
    status: "Paid",
    mode: "Cash",
  });

  const [stats, setStats] = useState({
    collected: "₹0",
    pendingDues: "₹0",
    pendingCount: 0,
  });

  // Load the real per-student monthly fee report from the backend, and refetch
  // whenever the status filter pill or page changes (the backend supports
  // filtering by status and paginates the underlying enrollment scan).
  useEffect(() => {
    let ignore = false;

    async function loadFeeStatus() {
      setIsLoading(true);
      const statusParam = filter === "All" ? undefined : filter.toLowerCase();
      const res = await apiGetFeeStatus({ status: statusParam, page, limit: PAGE_SIZE });
      // apiGetFeeStatus already toasts on failure; a null result just means "show nothing".
      if (ignore) return;

      if (res) {
        const mapped = (res.students || []).map((s) => ({
          // A student can have more than one enrollment (multiple classes),
          // each its own row — enrollmentId is the actually-unique key here,
          // studentId alone would collide across a student's rows.
          id: s.enrollmentId,
          studentId: s.studentId,
          enrollmentId: s.enrollmentId,
          student: s.studentName,
          email: s.email,
          class: s.className,
          fee: `₹${(s.feeRupees ?? 0).toLocaleString("en-IN")}`,
          dueDate: s.dueDate || "—",
          status: s.status,
          paymentId: s.paymentId,
          // The fee-status endpoint has no receipt number or paid date — these
          // stay placeholders unless the optional payments enrichment below
          // fills them in. Payment mode isn't stored anywhere either, but
          // every real payment in this app goes through Razorpay online
          // (there's no persisted cash/manual path), so a Paid row's mode is
          // always known even without a dedicated field.
          receiptNo: "—",
          paidDate: "—",
          mode: s.status === "Paid" ? "Online (Razorpay)" : "—",
        }));
        setFeeRows(mapped);
        setMonthLabel(res.month || "");
        setTotalPages(res.totalPages || 1);
        setStats({
          collected: `₹${(res.collectedThisMonthRupees ?? 0).toLocaleString("en-IN")}`,
          pendingDues: `₹${(res.pendingDuesRupees ?? 0).toLocaleString("en-IN")}`,
          pendingCount: res.studentsPendingCount ?? 0,
        });

        // Optional enrichment: for this page's Paid rows, look up their exact
        // Payment records (by id, not the whole "every paid payment ever"
        // set) so we can show a real razorpayPaymentId (as a pseudo receipt
        // number) and a real paid date instead of "—".
        const paidRowsWithPaymentId = mapped.filter((r) => r.status === "Paid" && r.paymentId);
        if (paidRowsWithPaymentId.length > 0) {
          const ids = paidRowsWithPaymentId.map((r) => r.paymentId).join(",");
          const payments = await apiGetPayments({ ids });
          if (!ignore && payments) {
            const paymentById = new Map(payments.map((p) => [p.id, p]));
            setFeeRows((prev) =>
              prev.map((row) => {
                const match = row.paymentId ? paymentById.get(row.paymentId) : null;
                if (!match) return row;
                return {
                  ...row,
                  receiptNo: match.razorpayPaymentId || "—",
                  paidDate: match.createdAt
                    ? new Date(match.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—",
                };
              })
            );
          }
        }
      } else {
        setFeeRows([]);
      }

      setIsLoading(false);
    }

    loadFeeStatus();
    return () => {
      ignore = true;
    };
  }, [filter, page]);

  function handleFilterChange(next) {
    setFilter(next);
    setPage(1);
  }

  async function handleDownloadReceipt(row) {
    if (!row?.paymentId) return;
    setDownloadingReceipt(true);
    await apiDownloadReceipt(row.paymentId);
    setDownloadingReceipt(false);
  }

  async function handleSendReminder(row) {
    setSendingReminderId(row.id);
    await apiSendFeeReminder({ enrollmentId: row.enrollmentId });
    setSendingReminderId(null);
  }

  async function handleSendAllReminders() {
    setIsSendingAllReminders(true);
    await apiSendAllFeeReminders();
    setIsSendingAllReminders(false);
  }

  // NOTE: the backend has no endpoint to manually record/mark a fee as paid and no endpoint
  // to edit an existing payment's amount/mode/date, so "Record Payment" and "Edit Fee" below
  // are kept as local-only UI state changes (not persisted, not sent to any API). Likewise
  // the "Mark as Paid" toggle and "Delete" action below only mutate local state — refreshing
  // the page (or changing the filter, which refetches) will restore the real backend data.
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
            onClick={handleSendAllReminders}
            disabled={isSendingAllReminders}
            className="inline-flex items-center justify-center rounded-xl border border-[#F3E2EC] bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-xs hover:bg-[#FBEBF3] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSendingAllReminders ? "Sending…" : "Remind All Pending"}
          </button>
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
              onClick={() => handleFilterChange(f)}
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
            Monthly Fee Status{monthLabel ? ` – ${monthLabel}` : ""}
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            {feeRows.length} Students
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                    Loading fee status…
                  </td>
                </tr>
              ) : feeRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                    No fee records found for {filter}.
                  </td>
                </tr>
              ) : (
                feeRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-800">
                      {row.student}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{row.class}</td>
                    <td className="px-4 py-3.5 font-bold text-gray-900">{row.fee}</td>
                    <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{row.dueDate}</td>
                    <td className="px-4 py-3.5 text-center">
                      {row.status === "Paid" ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-[#E8F8EE] px-3.5 py-0.5 text-xs font-medium text-[#16A34A]">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center rounded-full bg-[#FEF3E2] px-3.5 py-0.5 text-xs font-medium text-[#D97706]">
                          Pending
                        </span>
                      )}
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

                        {/* If Pending: Mark as Paid quick button (local-only, see note above) */}
                        {row.status !== "Paid" && (
                          <button
                            onClick={() => handleMarkAsPaid(row.id)}
                            title="Mark as Paid (local only, not saved)"
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}

                        {/* If Pending: Send Reminder email via the real /api/payments/remind endpoint */}
                        {row.status !== "Paid" && (
                          <button
                            onClick={() => handleSendReminder(row)}
                            disabled={sendingReminderId === row.id}
                            title="Send Fee Reminder Email"
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Record / Collect Payment Modal */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">
              Record Student Fee
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Note: there is no backend endpoint to record a manual/cash payment yet, so this
              only updates the table on this screen and is not saved.
            </p>
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
                <span className="font-medium text-gray-800">{monthLabel || "—"}</span>
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
                onClick={() => handleDownloadReceipt(viewingReceipt)}
                disabled={downloadingReceipt || !viewingReceipt.paymentId}
                title={!viewingReceipt.paymentId ? "No payment record found for this receipt" : undefined}
                className="rounded-xl border border-[#F3E2EC] px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {downloadingReceipt ? "Downloading…" : "Download Receipt"}
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
