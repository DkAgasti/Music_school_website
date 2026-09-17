"use client";

import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export default function AdmissionPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Admission</h1>
        <p className="mt-4 text-gray-600">
          Online admission form goes here.
        </p>
      </main>
      <Footer />
    </>
  );
}
