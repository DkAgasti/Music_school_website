"use client";

import { createContext, useContext, useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";

const AdmissionContext = createContext({
  isOpen: false,
  initialData: null,
  openAdmission: () => {},
  closeAdmission: () => {},
});

function SearchParamsReader({ onQuery }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      const admissionParam = searchParams.get("admission");
      const classParam = searchParams.get("class");
      if (
        admissionParam === "open" ||
        admissionParam === "true" ||
        admissionParam === "1" ||
        classParam
      ) {
        onQuery(classParam ? { selectedClass: classParam } : null);
      }
    }
  }, [searchParams, onQuery]);

  return null;
}

export function AdmissionProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialData, setInitialData] = useState(null);

  const openAdmission = useCallback((data = null) => {
    setInitialData(data);
    setIsOpen(true);
  }, []);

  const closeAdmission = useCallback(() => {
    setIsOpen(false);
    setInitialData(null);
  }, []);

  const handleQuery = useCallback((data) => {
    setInitialData(data);
    setIsOpen(true);
  }, []);

  return (
    <AdmissionContext.Provider
      value={{
        isOpen,
        initialData,
        openAdmission,
        closeAdmission,
      }}
    >
      <Suspense fallback={null}>
        <SearchParamsReader onQuery={handleQuery} />
      </Suspense>
      {children}
    </AdmissionContext.Provider>
  );
}

export function useAdmission() {
  const context = useContext(AdmissionContext);
  if (!context) {
    throw new Error("useAdmission must be used within an AdmissionProvider");
  }
  return context;
}

