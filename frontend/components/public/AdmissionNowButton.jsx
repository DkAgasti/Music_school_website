"use client";

import { useAdmission } from "@/context/AdmissionContext";

export default function AdmissionNowButton({ className, selectedClass, children }) {
  const { openAdmission } = useAdmission();

  return (
    <button
      type="button"
      onClick={() => openAdmission(selectedClass ? { selectedClass } : null)}
      className={className}
    >
      {children || "Admission Now"}
    </button>
  );
}

