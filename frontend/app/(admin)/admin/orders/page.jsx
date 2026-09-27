"use client";

import { useState, useEffect } from "react";
import { apiGetOrders, apiUpdateOrderStatus } from "@/Api/admin/shopOrderApi";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
// "Pending" is a system state set automatically before payment completes —
// an admin should never be able to manually move a paid/shipped order back
// to Pending, so it's excluded from the editable dropdown (still shown in
// the filter pills and badge styles since real pending orders do exist).
const EDITABLE_STATUS_OPTIONS = STATUS_OPTIONS.filter((s) => s !== "PENDING");
// A "Pending" order means checkout was started but payment never completed —
// not a real order, so it's never shown here (matches the same "only show
// Paid" rule used on the student Payment History page).
const FILTER_OPTIONS = ["All", ...EDITABLE_STATUS_OPTIONS];

const STATUS_BADGE_STYLES = {
  PENDING: "bg-[#FEF3E2] text-[#D97706]",
  PAID: "bg-[#E8F8EE] text-[#16A34A]",
  SHIPPED: "bg-[#E0F2FE] text-[#0284C7]",
  DELIVERED: "bg-[#EDE9FE] text-[#7C3AED]",
  CANCELLED: "bg-[#FFE4E6] text-[#E11D48]",
};

function formatRupees(amountPaise) {
  const rupees = Math.round((amountPaise || 0) / 100);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusSelect({ value, onChange }) {
  // A genuinely-pending order (payment not completed yet) still needs to show
  // "Pending" as its current value, but it must not be re-selectable once the
  // order has moved past it — so it's only included, disabled, when it's the
  // current value.
  const options =
    value === "PENDING" ? ["PENDING", ...EDITABLE_STATUS_OPTIONS] : EDITABLE_STATUS_OPTIONS;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`cursor-pointer rounded-full border-0 px-3 py-0.5 text-xs font-medium focus:outline-none ${
        STATUS_BADGE_STYLES[value] || "bg-gray-100 text-gray-600"
      }`}
    >
      {options.map((s) => (
        <option key={s} value={s} disabled={s === "PENDING"}>
          {s.charAt(0) + s.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewingOrder, setViewingOrder] = useState(null);

  useEffect(() => {
    loadOrders(1, statusFilter);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function loadOrders(pageToLoad, filter) {
    setLoading(true);
    const params = { page: pageToLoad, limit: PAGE_SIZE };
    if (filter && filter !== "All") params.status = filter;
    const res = await apiGetOrders(params);
    if (res && Array.isArray(res.items)) {
      setOrders(res.items);
      setTotalPages(res.totalPages);
    }
    setLoading(false);
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    loadOrders(nextPage, statusFilter);
  }

  function exportCSV() {
    const headers = ["Order ID", "Customer", "Product", "Amount", "Status", "Date", "Email", "Phone", "Address"];
    const rows = orders.map((r) => [
      r.id,
      r.buyerName,
      r.product?.name || "",
      formatRupees((r.product?.price || 0) * (r.quantity || 1)),
      r.status,
      formatDate(r.createdAt),
      r.buyerEmail,
      r.buyerPhone,
      `"${r.buyerAddress || ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shop_orders_${statusFilter.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleStatusChange(id, newStatus) {
    const updated = await apiUpdateOrderStatus(id, newStatus);
    if (updated) {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === id ? { ...ord, ...updated } : ord))
      );
      setViewingOrder((prev) => (prev && prev.id === id ? { ...prev, ...updated } : prev));
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Shop Orders
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Orders placed through the shop
          </p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTER_OPTIONS.map((f) => {
          const isActive = statusFilter === f;
          const label = f === "All" ? "All" : f.charAt(0) + f.slice(1).toLowerCase();
          return (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "bg-white text-gray-700 border border-[#F3E2EC] hover:bg-[#FBEBF3]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-[#F3E2EC] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg font-bold text-gray-900">
            All Orders
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
                <th className="rounded-l-xl px-4 py-3 font-semibold text-gray-600">Order ID</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Product</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Amount</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Date</th>
                <th className="rounded-r-xl px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9EBF2] text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gray-400">
                    No orders found matching {statusFilter}.
                  </td>
                </tr>
              ) : (
                orders.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-gray-900 font-mono text-xs">
                      {row.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5 text-gray-800 font-medium">{row.buyerName}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.product?.name || "—"}</td>
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      {formatRupees((row.product?.price || 0) * (row.quantity || 1))}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusSelect
                        value={row.status}
                        onChange={(newStatus) => handleStatusChange(row.id, newStatus)}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-center text-gray-500 font-mono text-xs">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* View Order Icon */}
                        <button
                          onClick={() => setViewingOrder(row)}
                          title="View Order Details"
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

      {/* View Order Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <div className="flex items-center justify-between border-b border-[#F3E2EC] pb-4 mb-5">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  Order Details: {viewingOrder.id.slice(0, 8).toUpperCase()}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Placed on {formatDate(viewingOrder.createdAt)}</p>
              </div>
              <StatusSelect
                value={viewingOrder.status}
                onChange={(newStatus) => handleStatusChange(viewingOrder.id, newStatus)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Customer Name</span>
                <span className="text-gray-800 font-semibold text-sm">{viewingOrder.buyerName}</span>
              </div>
              <div className="bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Total Amount</span>
                <span className="text-gray-900 font-bold text-sm">
                  {formatRupees((viewingOrder.product?.price || 0) * (viewingOrder.quantity || 1))}
                </span>
              </div>
              <div className="bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Product Ordered</span>
                <span className="text-gray-800 font-semibold text-sm">
                  {viewingOrder.product?.name || "—"} (x{viewingOrder.quantity || 1})
                </span>
              </div>
              <div className="bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Phone</span>
                <span className="text-gray-800 font-semibold text-sm">{viewingOrder.buyerPhone || "—"}</span>
              </div>
              <div className="col-span-2 bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Customer Email</span>
                <span className="text-gray-800 font-semibold text-sm">{viewingOrder.buyerEmail || "—"}</span>
              </div>
              <div className="col-span-2 bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Delivery Address / Notes</span>
                <span className="text-gray-800 font-medium text-sm">{viewingOrder.buyerAddress || "—"}</span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-5 mt-5 border-t border-[#F3E2EC]">
              <button
                onClick={() => setViewingOrder(null)}
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
