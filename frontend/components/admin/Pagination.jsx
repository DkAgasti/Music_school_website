"use client";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="rounded-lg border border-[#F3E2EC] px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-[#E11D48] hover:text-[#E11D48] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#F3E2EC] disabled:hover:text-gray-600 cursor-pointer"
      >
        Previous
      </button>
      <span className="text-xs text-gray-500">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="rounded-lg border border-[#F3E2EC] px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-[#E11D48] hover:text-[#E11D48] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#F3E2EC] disabled:hover:text-gray-600 cursor-pointer"
      >
        Next
      </button>
    </div>
  );
}
