"use client";

import { useEffect, Suspense } from "react";
import { useAdmission } from "@/context/AdmissionContext";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

function AdmissionContent() {
  const { openAdmission } = useAdmission();
  const searchParams = useSearchParams();

  useEffect(() => {
    const classParam = searchParams?.get("class");
    openAdmission(classParam ? { selectedClass: classParam } : null);
  }, [openAdmission, searchParams]);

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex items-center justify-center bg-[#FFF7F9] relative overflow-hidden">
        {/* Background Artwork */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-25 select-none overflow-hidden">
          <img
            src="https://res.cloudinary.com/vpetrpeu/image/upload/v1789904977/admission_background.jpg"
            alt="Admission"
            className="w-full h-full object-cover scale-x-[-1]"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function AdmissionPage() {
  return (
    <Suspense fallback={null}>
      <AdmissionContent />
    </Suspense>
  );
}
