"use client";

import { useEffect, useState } from "react";
import { apiGetMyProfile } from "@/Api/student/studentApi";
import { apiDownloadReceipt } from "@/Api/student/paymentsApi";
import Pagination from "@/components/student/Pagination";

const PAGE_SIZE = 8;

function rupees(amount) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export default function StudentPaymentsPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);

  async function handleDownload(paymentId) {
    setDownloadingId(paymentId);
    await apiDownloadReceipt(paymentId);
    setDownloadingId(null);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await apiGetMyProfile();
      if (!cancelled && result) setProfile(result);
      if (!cancelled) setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (!profile) return <p className="text-sm text-gray-500">Failed to load your data.</p>;

  const { paymentsSummary } = profile;
  const totalPaid = paymentsSummary.totalPaidRupees;
  const pendingDues = paymentsSummary.pendingDuesRupees;
  const nextDueDate = paymentsSummary.nextDueDate;
  const transactions = paymentsSummary.transactions
    .filter((t) => t.status === "Paid")
    .map((t) => ({
      id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amountRupees,
      status: t.status,
    }));

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const nextDueLabel = new Date(nextDueDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="mt-1 text-sm text-gray-500">All your fee payments in one place</p>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="rounded-xl border border-pink-100/70 bg-white p-3.5 sm:p-5">
          <p className="text-xs text-gray-500 sm:text-sm">Total Paid</p>
          <p className="mt-1.5 text-lg font-bold text-gray-900 sm:mt-2 sm:text-2xl">{rupees(totalPaid)}</p>
        </div>
        <div className="rounded-xl border border-pink-100/70 bg-white p-3.5 sm:p-5">
          <p className="text-xs text-gray-500 sm:text-sm">Pending Dues</p>
          <p className="mt-1.5 text-lg font-bold text-green-600 sm:mt-2 sm:text-2xl">{rupees(pendingDues)}</p>
        </div>
        <div className="rounded-xl border border-pink-100/70 bg-white p-3.5 sm:p-5">
          <p className="text-xs text-gray-500 sm:text-sm">Next Due Date</p>
          <p className="mt-1.5 text-lg font-bold text-gray-900 sm:mt-2 sm:text-2xl">{nextDueLabel}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-6 rounded-2xl border border-pink-100/70 bg-white p-4 sm:p-7">
        <h2 className="font-serif text-xl font-bold text-gray-900">Transactions</h2>

        {paginatedTransactions.length === 0 ? (
          <p className="mt-6 text-center text-sm text-gray-500">No transactions yet.</p>
        ) : (
          <>
            {/* Mobile: stacked cards instead of a cramped, horizontally-scrolling table */}
            <div className="mt-4 space-y-2.5 sm:hidden">
              {paginatedTransactions.map((txn) => (
                <div key={txn.id} className="rounded-xl border border-gray-100 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{txn.description}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {new Date(txn.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-gray-900">{rupees(txn.amount)}</p>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        txn.status === "Paid"
                          ? "bg-green-50 text-green-700"
                          : txn.status === "Pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {txn.status}
                    </span>
                    {txn.status === "Paid" && (
                      <button
                        type="button"
                        onClick={() => handleDownload(txn.id)}
                        disabled={downloadingId === txn.id}
                        className="text-sm font-semibold text-[#E11D48] hover:text-[#D81B60] disabled:opacity-60 cursor-pointer"
                      >
                        {downloadingId === txn.id ? "Downloading…" : "Download"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / tablet: table */}
            <div className="mt-4 hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="bg-gray-50 py-3 pl-4 pr-4 font-semibold first:rounded-l-lg">Date</th>
                    <th className="bg-gray-50 py-3 pr-4 font-semibold">Description</th>
                    <th className="bg-gray-50 py-3 pr-4 font-semibold">Amount</th>
                    <th className="bg-gray-50 py-3 pr-4 font-semibold">Status</th>
                    <th className="bg-gray-50 py-3 pr-4 font-semibold text-right last:rounded-r-lg">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedTransactions.map((txn) => (
                    <tr key={txn.id}>
                      <td className="py-3 pl-4 pr-4 text-gray-700">
                        {new Date(txn.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{txn.description}</td>
                      <td className="py-3 pr-4 font-semibold text-gray-900">{rupees(txn.amount)}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            txn.status === "Paid"
                              ? "bg-green-50 text-green-700"
                              : txn.status === "Pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {txn.status === "Paid" ? (
                          <button
                            type="button"
                            onClick={() => handleDownload(txn.id)}
                            disabled={downloadingId === txn.id}
                            className="text-sm font-semibold text-[#E11D48] hover:text-[#D81B60] disabled:opacity-60 cursor-pointer"
                          >
                            {downloadingId === txn.id ? "Downloading…" : "Download"}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
