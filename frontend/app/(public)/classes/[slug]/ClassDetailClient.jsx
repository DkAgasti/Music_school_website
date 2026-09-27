"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import AdmissionNowButton from "@/components/public/AdmissionNowButton";
import { apiGetClassBySlug } from "@/Api/public/classApi";

export default function ClassDetailClient({ slug }) {
  const [musicClass, setMusicClass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGetClassBySlug(slug).then((res) => {
      if (cancelled) return;
      setMusicClass(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return null;

  if (!musicClass) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            Class Not Found
          </h1>
          <p className="mt-3 text-gray-600">
            The class you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/classes"
            className="mt-6 inline-block rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            Explore All Classes
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // Data normalization — only real fields from the API are used. Anything
  // not present in the database is shown as "Not specified" rather than
  // fabricated placeholder content.
  const classTitle = musicClass.name;
  const mainImage = musicClass.imageUrl || null;
  const heroImage = musicClass.imageUrl || null;

  const aboutDescription = musicClass.description || "No description available yet.";

  const syllabusItems = musicClass.syllabus
    ? musicClass.syllabus.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const teacher = musicClass.teachers?.[0] || null;

  const primaryFeePlan = musicClass.feePlans?.[0];
  const primaryBatch = musicClass.batches?.[0];

  const duration = musicClass.durationMonths
    ? `${musicClass.durationMonths} Month${musicClass.durationMonths > 1 ? "s" : ""}`
    : "Not specified";
  const feeDisplay = primaryFeePlan
    ? `₹${Math.round(primaryFeePlan.amount / 100).toLocaleString("en-IN")}${
        primaryFeePlan.durationMonths
          ? ` / ${primaryFeePlan.durationMonths} month${
              primaryFeePlan.durationMonths > 1 ? "s" : ""
            }`
          : ""
      }`
    : "Not specified";
  const batchTiming = primaryBatch?.schedule || "Not specified";
  const location = "Not specified";
  const seatsLeft = primaryBatch
    ? Math.max(primaryBatch.capacity - (primaryBatch._count?.enrollments || 0), 0)
    : null;
  const availableSeats =
    seatsLeft !== null ? `${seatsLeft} Seat${seatsLeft === 1 ? "" : "s"} Left` : "Not specified";

  return (
    <>
      <Navbar />

      {/* Hero Banner Section — same pattern as the Classes listing page */}
      <section className="relative w-full overflow-hidden bg-white pt-0 pb-0">
        {/* Constrained container for text (tablet/desktop only) */}
        <div className="hidden md:block mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid items-center gap-2 md:grid-cols-12 md:gap-8 md:min-h-[220px]">
            <div className="md:col-span-7 lg:col-span-6 z-10">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-gray-950">
                {classTitle}
              </h1>
            </div>
            <div className="hidden md:block md:col-span-5 lg:col-span-6" />
          </div>
        </div>

        {/* Right image: flush to top, bottom, and right edge of screen (tablet/desktop). */}
        <div className="hidden md:block md:absolute md:top-0 md:bottom-0 md:right-0 md:w-[50%] lg:w-[48%] xl:w-[46%] md:h-full overflow-hidden">
          <div className="relative h-full w-full overflow-hidden">
            {heroImage ? (
              <img
                src={heroImage}
                alt={classTitle}
                className="h-full w-full object-cover object-[right_center] select-none pointer-events-none"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-brand-100 via-brand-200 to-brand-300" />
            )}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-2/5 sm:w-1/3 bg-gradient-to-r from-white via-white/80 to-transparent" />
          </div>
        </div>

        {/* Mobile: full-width image with text overlaid directly on it */}
        <div className="md:hidden relative h-[260px] sm:h-[300px] w-full overflow-hidden">
          {heroImage ? (
            <img
              src={heroImage}
              alt={classTitle}
              className="absolute inset-0 h-full w-full object-cover object-[right_center]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-100 via-brand-200 to-brand-300" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5 sm:px-8 sm:pb-6">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {classTitle}
            </h1>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <nav
        className="mx-auto max-w-6xl px-5 sm:px-8 pt-6 pb-2"
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center gap-2 text-xs sm:text-sm">
          <li>
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
          </li>
          <li className="text-gray-400">›</li>
          <li>
            <Link
              href="/classes"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Classes
            </Link>
          </li>
          <li className="text-gray-400">›</li>
          <li className="font-semibold text-brand-500">{musicClass.name}</li>
        </ol>
      </nav>

      {/* Main Content: 2-Column Grid */}
      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column */}
          <div className="lg:col-span-7">
            {/* Main Class Photo */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-sm bg-gray-50">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={classTitle}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 text-sm text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {/* About the Class */}
            <section className="mt-8">
              <h2 className="font-serif text-2xl font-bold text-gray-900">
                About the Class
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-gray-600">
                {aboutDescription}
              </p>
            </section>

            {/* Syllabus */}
            <section className="mt-8">
              <h2 className="font-serif text-2xl font-bold text-gray-900">
                Syllabus
              </h2>
              {syllabusItems.length === 0 && (
                <p className="mt-3 text-sm text-gray-500">No syllabus added yet.</p>
              )}
              <ul className="mt-4 space-y-3.5">
                {syllabusItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="flex-shrink-0 text-brand-500">
                      <svg
                        className="h-4 w-4 stroke-brand-500 stroke-[2.5]"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    <span className="text-sm sm:text-base text-gray-700">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5">
            {/* Quick Details List */}
            <div className="space-y-5 sm:space-y-6">
              {/* Teacher */}
              <div className="flex items-center gap-4">
                <div className="flex h-7 w-7 items-center justify-center text-brand-500 shrink-0">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">
                    Teacher
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-tight mt-1">
                    {teacher?.name || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-4">
                <div className="flex h-7 w-7 items-center justify-center text-brand-500 shrink-0">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 7v5l3 2.5"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">
                    Duration
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-tight mt-1">
                    {duration}
                  </p>
                </div>
              </div>

              {/* Fee */}
              <div className="flex items-center gap-4">
                <div className="flex h-7 w-7 items-center justify-center text-brand-500 shrink-0">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <rect
                      x="5"
                      y="3"
                      width="14"
                      height="18"
                      rx="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="8"
                      y1="8"
                      x2="16"
                      y2="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="8"
                      y1="12"
                      x2="16"
                      y2="12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="8"
                      y1="16"
                      x2="13"
                      y2="16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">
                    Fee
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-tight mt-1">
                    {feeDisplay}
                  </p>
                </div>
              </div>

              {/* Batch Timing */}
              <div className="flex items-center gap-4">
                <div className="flex h-7 w-7 items-center justify-center text-brand-500 shrink-0">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                    <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                    <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">
                    Batch Timing
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-tight mt-1">
                    {batchTiming}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4">
                <div className="flex h-7 w-7 items-center justify-center text-brand-500 shrink-0">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <circle
                      cx="12"
                      cy="11"
                      r="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">
                    Location
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-tight mt-1">
                    {location}
                  </p>
                </div>
              </div>

              {/* Available Seats */}
              <div className="flex items-center gap-4">
                <div className="flex h-7 w-7 items-center justify-center text-brand-500 shrink-0">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">
                    Available Seats
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-tight mt-1">
                    {availableSeats}
                  </p>
                </div>
              </div>
            </div>

            {/* Admission Button */}
            <AdmissionNowButton
              selectedClass={musicClass.slug}
              className="mt-8 block w-full rounded-lg bg-brand-500 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md cursor-pointer"
            >
              Admission Now
            </AdmissionNowButton>

            {/* Meet Your Teacher Section */}
            <div className="mt-9">
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-4">
                Meet Your Teacher
              </h3>
              {teacher ? (
                <div className="flex items-center gap-5">
                  <div className="h-32 w-28 sm:h-36 sm:w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {teacher.photoUrl ? (
                      <img
                        src={teacher.photoUrl}
                        alt={teacher.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                      {teacher.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 mb-3">
                      {teacher.bio || "Not specified"}
                    </p>
                    <Link
                      href="/teachers"
                      className="rounded-lg border border-brand-500 px-4 py-1.5 text-xs font-semibold text-brand-500 transition-colors hover:bg-brand-50"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No teacher assigned yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quote Banner */}
        <div className="relative my-10 sm:my-14 overflow-hidden rounded-2xl bg-[#FDEBF5] px-8 sm:px-14 py-9 sm:py-12">
          <div className="relative z-10 max-w-xl">
            <p className="font-serif text-xl sm:text-2xl md:text-[26px] italic leading-snug text-brand-500 font-normal">
              &ldquo; Music is not just a skill,
              <span className="block pl-6 sm:pl-10 mt-1.5">
                it&apos;s a lifelong companion. &rdquo;
              </span>
            </p>
          </div>
          {/* Decorative musical waves with musical note */}
          <div className="pointer-events-none absolute right-0 bottom-0 top-0 w-1/3 min-w-[200px] max-w-[320px]">
            <img
              src="/images/classes/quote-music-waves.png"
              alt=""
              className="h-full w-full object-contain object-right-bottom"
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
