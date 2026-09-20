"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const DEFAULT_ORDERS = [
  { id: "o-1", orderId: "ORD-1042", customer: "Neha Kapoor", email: "neha.k@gmail.com", phone: "+91 98765 11001", product: "Guitar Book – Level 1", amount: "₹499", payment: "Paid", date: "28 Apr 2025", address: "Flat 4B, Silver Heights, FC Road, Pune" },
  { id: "o-2", orderId: "ORD-1041", customer: "Sahil Verma", email: "sahil.v@gmail.com", phone: "+91 98765 11002", product: "Piano Book – Level 1", amount: "₹599", payment: "Paid", date: "27 Apr 2025", address: "12/A Green Park, Aundh, Pune" },
  { id: "o-3", orderId: "ORD-1040", customer: "Riddhi Das", email: "riddhi.d@gmail.com", phone: "+91 98765 11003", product: "Tabla Set", amount: "₹8,000", payment: "Paid", date: "26 Apr 2025", address: "B-201 Orchid Palms, Baner, Pune" },
  { id: "o-4", orderId: "ORD-1039", customer: "Arjun Iyer", email: "arjun.i@gmail.com", phone: "+91 98765 11004", product: "Acoustic Guitar", amount: "₹12,000", payment: "Pending", date: "25 Apr 2025", address: "7 Sunny Vista, Kothrud, Pune" },
  { id: "o-5", orderId: "ORD-1038", customer: "Tanvi Shah", email: "tanvi.s@gmail.com", phone: "+91 98765 11005", product: "Guitar Book – Level 1", amount: "₹499", payment: "Paid", date: "24 Apr 2025", address: "House 3, Gulmohar Society, Viman Nagar, Pune" },
  { id: "o-6", orderId: "ORD-1037", customer: "Kunal Puri", email: "kunal.p@gmail.com", phone: "+91 98765 11006", product: "Violin", amount: "₹9,500", payment: "Paid", date: "23 Apr 2025", address: "Penthouse 9, Royal Towers, Kalyani Nagar, Pune" },
  { id: "o-7", orderId: "ORD-1036", customer: "Sneha Iyer", email: "sneha.i@gmail.com", phone: "+91 98765 11007", product: "Piano Book – Level 1", amount: "₹599", payment: "Paid", date: "22 Apr 2025", address: "44 River Road, Koregaon Park, Pune" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState(DEFAULT_ORDERS);
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState({
    customer: "",
    email: "",
    phone: "",
    product: "Guitar Book – Level 1",
    amount: "₹499",
    payment: "Paid",
    address: "",
  });

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await api.get("/shop/orders", { auth: true });
        if (res && Array.isArray(res) && res.length > 0) {
          const mapped = res.map((ord, index) => ({
            id: ord.id,
            orderId: ord.orderCode || `ORD-${1042 - index}`,
            customer: ord.buyerName || "Customer",
            email: ord.buyerEmail || "—",
            phone: ord.buyerPhone || "—",
            product: ord.product?.title || ord.product?.name || "Guitar Book",
            amount: ord.totalAmount ? `₹${Math.round(ord.totalAmount / 100).toLocaleString("en-IN")}` : "₹499",
            payment: ord.status === "PAID" ? "Paid" : "Pending",
            date: new Date(ord.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            address: ord.shippingAddress || "In-school pickup",
          }));
          setOrders(mapped);
        }
      } catch (err) {
        console.warn("Using template orders:", err.message);
      }
    }
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((ord) => {
    if (statusFilter === "All") return true;
    return ord.payment.toLowerCase() === statusFilter.toLowerCase();
  });

  function exportCSV() {
    const headers = ["Order ID", "Customer", "Product", "Amount", "Payment", "Date", "Email", "Phone", "Address"];
    const rows = filteredOrders.map((r) => [r.orderId, r.customer, r.product, r.amount, r.payment, r.date, r.email, r.phone, `"${r.address}"`]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shop_orders_${statusFilter.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleCreateOrder(e) {
    e.preventDefault();
    const newOrder = {
      id: `o-${Date.now()}`,
      orderId: `ORD-${1043 + orders.length}`,
      customer: form.customer,
      email: form.email,
      phone: form.phone || "—",
      product: form.product,
      amount: form.amount.startsWith("₹") ? form.amount : `₹${form.amount}`,
      payment: form.payment,
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      address: form.address || "Counter Pickup",
    };
    // Always prepend new order to top!
    setOrders([newOrder, ...orders]);
    setShowCreateModal(false);
    setForm({ customer: "", email: "", phone: "", product: "Guitar Book – Level 1", amount: "₹499", payment: "Paid", address: "" });
  }

  function handleTogglePayment(id) {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === id ? { ...ord, payment: ord.payment === "Paid" ? "Pending" : "Paid" } : ord
      )
    );
  }

  function handleDeleteOrder(id, orderId) {
    if (!confirm(`Are you sure you want to delete order ${orderId}?`)) return;
    setOrders((prev) => prev.filter((ord) => ord.id !== id));
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-[#BE123C] transition-colors cursor-pointer self-start sm:self-auto"
        >
          Create Order
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["All", "Paid", "Pending"].map((f) => {
          const isActive = statusFilter === f;
          return (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
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
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Payment</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Date</th>
                <th className="rounded-r-xl px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9EBF2] text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gray-400">
                    No orders found matching {statusFilter}.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-gray-900 font-mono text-xs">
                      {row.orderId}
                    </td>
                    <td className="px-4 py-3.5 text-gray-800 font-medium">{row.customer}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.product}</td>
                    <td className="px-4 py-3.5 font-bold text-gray-900">{row.amount}</td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleTogglePayment(row.id)}
                        title="Click to toggle payment status"
                        className="cursor-pointer transition-transform hover:scale-105"
                      >
                        {row.payment === "Paid" ? (
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
                    <td className="px-4 py-3.5 text-center text-gray-500 font-mono text-xs">
                      {row.date}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* 1. View Order Icon */}
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

                        {/* 2. Delete Order Icon */}
                        <button
                          onClick={() => handleDeleteOrder(row.id, row.orderId)}
                          title="Delete Order"
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

      {/* View Order Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <div className="flex items-center justify-between border-b border-[#F3E2EC] pb-4 mb-5">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  Order Details: {viewingOrder.orderId}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Placed on {viewingOrder.date}</p>
              </div>
              <button
                onClick={() => {
                  handleTogglePayment(viewingOrder.id);
                  setViewingOrder((prev) => ({
                    ...prev,
                    payment: prev.payment === "Paid" ? "Pending" : "Paid",
                  }));
                }}
                className="cursor-pointer"
              >
                {viewingOrder.payment === "Paid" ? (
                  <span className="inline-flex items-center justify-center rounded-full bg-[#E8F8EE] px-3.5 py-0.5 text-xs font-medium text-[#16A34A]">
                    Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-full bg-[#FEF3E2] px-3.5 py-0.5 text-xs font-medium text-[#D97706]">
                    Pending
                  </span>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Customer Name</span>
                <span className="text-gray-800 font-semibold text-sm">{viewingOrder.customer}</span>
              </div>
              <div className="bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Total Amount</span>
                <span className="text-gray-900 font-bold text-sm">{viewingOrder.amount}</span>
              </div>
              <div className="bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Product Ordered</span>
                <span className="text-gray-800 font-semibold text-sm">{viewingOrder.product}</span>
              </div>
              <div className="bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Phone</span>
                <span className="text-gray-800 font-semibold text-sm">{viewingOrder.phone || "—"}</span>
              </div>
              <div className="col-span-2 bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Customer Email</span>
                <span className="text-gray-800 font-semibold text-sm">{viewingOrder.email}</span>
              </div>
              <div className="col-span-2 bg-[#FFF7FB] rounded-xl p-3 border border-[#F9EBF2]">
                <span className="text-gray-400 block mb-0.5 font-medium">Delivery Address / Notes</span>
                <span className="text-gray-800 font-medium text-sm">{viewingOrder.address}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 mt-5 border-t border-[#F3E2EC]">
              <button
                onClick={() => {
                  handleTogglePayment(viewingOrder.id);
                  setViewingOrder((prev) => ({
                    ...prev,
                    payment: prev.payment === "Paid" ? "Pending" : "Paid",
                  }));
                }}
                className="text-xs font-semibold text-[#E11D48] hover:underline cursor-pointer"
              >
                Mark as {viewingOrder.payment === "Paid" ? "Pending" : "Paid"}
              </button>
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

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Create Manual Order
            </h3>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  required
                  type="text"
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. ramesh@example.com"
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
                    placeholder="+91..."
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Ordered
                </label>
                <select
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                >
                  <option value="Acoustic Guitar">Acoustic Guitar (₹12,000)</option>
                  <option value="Digital Piano">Digital Piano (₹25,000)</option>
                  <option value="Tabla Set">Tabla Set (₹8,000)</option>
                  <option value="Violin">Violin (₹9,500)</option>
                  <option value="Guitar Book – Level 1">Guitar Book – Level 1 (₹499)</option>
                  <option value="Piano Book – Level 1">Piano Book – Level 1 (₹599)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <input
                    required
                    type="text"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={form.payment}
                    onChange={(e) => setForm({ ...form, payment: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Delivery Address / Notes
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="In-store pickup or address"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C] cursor-pointer"
                >
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
