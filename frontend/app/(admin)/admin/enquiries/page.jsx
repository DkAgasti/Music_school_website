"use client";

import { useState, useEffect } from "react";
import {
  apiGetEnquiries,
  apiToggleEnquiryHandled,
  apiDeleteEnquiry,
} from "@/Api/admin/enquiryApi";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 20;

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function mapEnquiry(item) {
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone || "—",
    message: item.message,
    handled: item.handled,
    date: formatDate(item.createdAt),
    status: item.handled ? "Replied" : "New",
  };
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewingEnquiry, setViewingEnquiry] = useState(null);

  async function loadEnquiries(pageToLoad, currentFilter, search) {
    setLoading(true);
    const params = { page: pageToLoad, limit: PAGE_SIZE };
    if (currentFilter === "New") params.handled = false;
    else if (currentFilter === "Replied") params.handled = true;
    if (search) params.search = search;

    const res = await apiGetEnquiries(params);
    if (res && Array.isArray(res.items)) {
      setEnquiries(res.items.map(mapEnquiry));
      setTotalPages(res.totalPages);
    }
    setLoading(false);
  }

  function handleFilterChange(next) {
    setFilter(next);
    setPage(1);
    loadEnquiries(1, next, searchTerm);
  }

  function handlePageChange(next) {
    setPage(next);
    loadEnquiries(next, filter, searchTerm);
  }

  // Reset to page 1 whenever the search term changes, debounced so we're not
  // firing a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadEnquiries(1, filter, searchTerm);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    loadEnquiries(1, "All", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleStatus(id) {
    const target = enquiries.find((e) => e.id === id);
    if (!target) return;
    const nextHandled = !target.handled;

    const result = await apiToggleEnquiryHandled(id, nextHandled);
    if (result) {
      setEnquiries((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, handled: nextHandled, status: nextHandled ? "Replied" : "New" }
            : e
        )
      );
      setViewingEnquiry((prev) =>
        prev && prev.id === id
          ? { ...prev, handled: nextHandled, status: nextHandled ? "Replied" : "New" }
          : prev
      );
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Are you sure you want to delete message from ${name}?`)) return;

    const success = await apiDeleteEnquiry(id);
    if (success) {
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      setViewingEnquiry((prev) => (prev && prev.id === id ? null : prev));
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Contact / Enquiries
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Messages from the website contact form
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["All", "New", "Replied"].map((tab) => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => handleFilterChange(tab)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#18181B] text-white shadow-xs"
                    : "bg-white text-gray-700 border border-[#F3E2EC] hover:bg-[#FBEBF3]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          placeholder="Search inquiries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-xs rounded-full border border-[#F3E2EC] px-3.5 py-1.5 focus:outline-none focus:border-[#E11D48] bg-white shadow-xs max-w-xs"
        />
      </div>

      {/* Enquiries Feed / Cards */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="rounded-2xl border border-[#F3E2EC] bg-white p-10 text-center text-xs text-gray-400">
            Loading enquiries...
          </div>
        ) : enquiries.length === 0 ? (
          <div className="rounded-2xl border border-[#F3E2EC] bg-white p-10 text-center text-xs text-gray-400">
            No enquiries found matching your criteria.
          </div>
        ) : (
          enquiries.map((item) => {
            const initial = item.name ? item.name.charAt(0).toUpperCase() : "?";

            return (
              <div
                key={item.id}
                className="group rounded-2xl border border-[#F3E2EC] bg-white p-5 shadow-xs hover:border-[#E11D48]/30 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left Side: Initial Avatar + Text */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    {/* Circle Avatar with Initial */}
                    <div className="h-10 w-10 shrink-0 rounded-full bg-[#FDEEF5] text-[#E11D48] font-bold text-sm flex items-center justify-center border border-[#F9EBF2]">
                      {initial}
                    </div>

                    {/* Sender Information & Message Preview */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {item.name}
                        </span>
                        <span className="text-xs text-gray-400 font-normal">
                          {item.email}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Date, Badge, and Quick Action Toolbar */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F9EBF2]">
                    <span className="text-xs text-gray-400 font-normal">
                      {item.date}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Status Toggle Pill */}
                      <button
                        onClick={() => toggleStatus(item.id)}
                        title="Click to toggle status"
                        className={`inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-medium cursor-pointer transition-transform hover:scale-105 ${
                          item.status === "New"
                            ? "bg-[#FEF3E2] text-[#D97706]"
                            : "bg-[#E8F8EE] text-[#16A34A]"
                        }`}
                      >
                        {item.status}
                      </button>

                      {/* 1. View Inquiry */}
                      <button
                        onClick={() => setViewingEnquiry(item)}
                        title="View Full Message"
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {/* 2. Reply via Email */}
                      <a
                        href={`mailto:${item.email}?subject=Regarding%20your%20inquiry%20at%20Synchrocity%20Music%20School`}
                        title="Reply via Email"
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>

                      {/* 3. Delete Inquiry */}
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        title="Delete Enquiry"
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FFE4E6] transition-colors cursor-pointer"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />

      {/* View Full Inquiry Modal */}
      {viewingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <div className="flex items-center justify-between border-b border-[#F3E2EC] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#FDEEF5] text-[#E11D48] font-bold text-sm flex items-center justify-center border border-[#F9EBF2]">
                  {viewingEnquiry.name ? viewingEnquiry.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900">
                    {viewingEnquiry.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {viewingEnquiry.email} • {viewingEnquiry.date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleStatus(viewingEnquiry.id)}
                className="cursor-pointer"
              >
                <span
                  className={`inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-medium ${
                    viewingEnquiry.status === "New"
                      ? "bg-[#FEF3E2] text-[#D97706]"
                      : "bg-[#E8F8EE] text-[#16A34A]"
                  }`}
                >
                  {viewingEnquiry.status}
                </span>
              </button>
            </div>

            <div className="bg-[#FFF7FB] rounded-xl p-4 border border-[#F9EBF2] mb-5">
              <span className="text-xs text-gray-400 block mb-1 font-semibold uppercase tracking-wider">Message</span>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {viewingEnquiry.message}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={`mailto:${viewingEnquiry.email}?subject=Regarding%20your%20inquiry%20at%20Synchrocity%20Music%20School`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#E11D48] px-4 py-2 text-xs font-semibold text-white hover:bg-[#BE123C] cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Send Reply Email</span>
              </a>
              <button
                onClick={() => setViewingEnquiry(null)}
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
