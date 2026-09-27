"use client";

import { useEffect, useState } from "react";
import TeacherCard from "@/components/public/TeacherCard";
import TeacherProfileModal from "@/components/public/TeacherProfileModal";
import { apiGetTeachers } from "@/Api/public/teacherApi";

export default function TeachersClient() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    apiGetTeachers().then((res) => setTeachers(res || []));
  }, []);

  return (
    <div className="w-full flex flex-col bg-[#FFF9FA] text-gray-900 antialiased">
      {/* ── 1. Hero Banner Section ───────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-white pt-0 pb-0">
        {/* Constrained container for text (tablet/desktop only) */}
        <div className="hidden md:block mx-auto max-w-6xl px-5 sm:px-6">
          <div className="grid items-center gap-2 md:grid-cols-12 md:gap-8 md:min-h-[270px] lg:min-h-[285px]">
            {/* Left text column */}
            <div className="md:col-span-7 lg:col-span-6 z-10">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-gray-900 leading-tight">
                Our Teachers
              </h1>
              <p className="mt-3 text-xs sm:text-sm md:text-base leading-relaxed text-gray-500 max-w-md">
                Learn from passionate and experienced instructors.
              </p>
            </div>

            {/* Desktop grid spacer so text doesn't overlap image */}
            <div className="hidden md:block md:col-span-5 lg:col-span-6" />
          </div>
        </div>

        {/* Right image: flush to top, bottom, and right edge of screen (tablet/desktop). */}
        <div className="hidden md:block md:absolute md:top-0 md:bottom-0 md:right-0 md:w-[50%] lg:w-[48%] xl:w-[46%] md:h-full overflow-hidden">
          <div className="relative h-full w-full overflow-hidden">
            <img
              src="https://res.cloudinary.com/vpetrpeu/image/upload/v1790145804/Teacher_hero.png"
              alt="Our Teachers"
              className="h-full w-full object-cover object-[right_center] select-none pointer-events-none"
            />
            {/* Soft gradient fade on the left to smoothly blend into page background */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-2/5 sm:w-1/3 bg-gradient-to-r from-white via-white/80 to-transparent" />
          </div>
        </div>

        {/* Mobile: full-width image with text overlaid directly on it */}
        <div className="md:hidden relative h-[260px] sm:h-[300px] w-full overflow-hidden">
          <img
            src="https://res.cloudinary.com/vpetrpeu/image/upload/v1790145367/Teacher_hero.png"
            alt="Our Teachers"
            className="absolute inset-0 h-full w-full object-cover object-[right_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5 sm:px-8 sm:pb-6">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Our Teachers
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-white/90 max-w-md">
              Learn from passionate and experienced instructors.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Teachers Grid Section ──────────────────────────────────────── */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-5 sm:px-6 pt-10 sm:pt-12 pb-16">
        {teachers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {teachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                onSelect={(t) => setSelectedTeacher(t)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">
            No teachers found yet.
          </p>
        )}

        {/* ── 3. Quote Banner ───────────────────────────────────────────── */}
        <div className="mt-14 sm:mt-16 rounded-2xl sm:rounded-3xl bg-[#FDF0F3] border border-pink-100/80 p-6 sm:p-8 text-center">
          <svg
            className="mx-auto h-6 w-6 sm:h-7 sm:w-7 text-[#E11D48] fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
          <p className="mx-auto mt-3 max-w-lg font-serif text-sm sm:text-base italic leading-relaxed text-gray-700">
            &ldquo;Great teachers don&apos;t just teach music,
            <br className="hidden sm:block" /> they inspire a lifelong love for it.&rdquo;
          </p>
          <div className="mx-auto mt-4 h-px w-14 bg-pink-300" />
        </div>
      </main>

      {/* ── 4. Interactive Teacher Profile Modal ──────────────────────────── */}
      <TeacherProfileModal
        teacher={selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
      />
    </div>
  );
}
