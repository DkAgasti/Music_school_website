"use client";

import AdmissionNowButton from "@/components/public/AdmissionNowButton";

export default function TeacherProfileModal({ teacher, onClose }) {
  if (!teacher) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white shadow-2xl border border-pink-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Banner */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-r from-[#F29BB9] via-[#EA84A9] to-[#D8578B] p-4 flex items-end justify-between">
          {teacher.photoUrl && (
            <>
              <img
                src={teacher.photoUrl}
                alt={teacher.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full bg-white/80 p-1.5 text-gray-700 hover:bg-white transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-white">
            <span className="inline-block rounded-full bg-black/20 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-xs">
              {teacher.experience || "Experienced Faculty"}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <h3 className="font-serif text-2xl font-bold text-gray-900">
            {teacher.name}
          </h3>
          <p className="mt-1 text-sm font-semibold text-[#E11D48]">
            {teacher.role}
          </p>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            {teacher.bio || "Dedicated mentor guiding students through comprehensive music education and performance excellence."}
          </p>

          {teacher.classes && teacher.classes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Courses Taught
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {teacher.classes.map((cls, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-pink-50 border border-pink-100 px-3 py-1 text-xs font-medium text-[#E11D48]"
                  >
                    {cls.name || cls}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <AdmissionNowButton className="rounded-lg bg-[#E11D48] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#D81B60] transition-colors">
              Apply for Admission
            </AdmissionNowButton>
          </div>
        </div>
      </div>
    </div>
  );
}
