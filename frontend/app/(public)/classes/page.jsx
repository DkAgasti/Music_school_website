import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import ClassCard from "@/components/public/ClassCard";
import { getClasses } from "@/lib/api";

export default async function ClassesPage() {
  const classes = await getClasses().catch(() => []);

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {/* ── Hero Banner Section ───────────────────────────── */}
        <section className="relative w-full overflow-hidden bg-white pt-0 pb-0">
          {/* Constrained container for text */}
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="grid items-center gap-6 md:grid-cols-12 md:gap-8 min-h-[220px] sm:min-h-[250px] md:min-h-[270px] lg:min-h-[285px]">
              {/* Left text column */}
              <div className="md:col-span-7 lg:col-span-6 py-6 sm:py-8 z-10">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-gray-900 leading-tight">
                  Music Classes / Courses
                </h1>
                <p className="mt-3 text-xs sm:text-sm md:text-base leading-relaxed text-gray-500 max-w-md">
                  Discover the right course for your musical journey.
                </p>
              </div>

              {/* Desktop grid spacer so text doesn't overlap image */}
              <div className="hidden md:block md:col-span-5 lg:col-span-6" />
            </div>
          </div>

          {/* Right image: flush to top, bottom, and right edge of screen */}
          <div className="md:absolute md:top-0 md:bottom-0 md:right-0 w-full md:w-[50%] lg:w-[48%] xl:w-[46%] h-[220px] sm:h-[250px] md:h-full overflow-hidden px-4 sm:px-6 md:px-0">
            <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-none">
              <img
                src="https://res.cloudinary.com/vpetrpeu/image/upload/v1789893103/Tabla.png"
                alt="Indian Classical Instruments - Tabla and Harmonium"
                className="h-full w-full object-cover object-[right_center] select-none pointer-events-none"
              />
              {/* Soft gradient fade on the left to smoothly blend into page background */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-2/5 sm:w-1/3 bg-gradient-to-r from-white via-white/80 to-transparent" />
            </div>
          </div>
        </section>

        {/* ── Course Cards Grid Section ─────────────────────── */}
        <section className="bg-[#FFF7F9] pt-6 pb-12 sm:pt-8 sm:pb-14 md:pt-10 md:pb-16">
          <div className="mx-auto max-w-6xl px-5">
            {/* 3-column Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-7">
              {classes.map((musicClass) => (
                <ClassCard key={musicClass.id} musicClass={musicClass} />
              ))}
            </div>

            {/* ── Call To Action Banner ─────────────────────── */}
            <div className="mt-12 rounded-2xl bg-[#FDEEF2] p-6 border border-pink-100/70 sm:p-7 md:mt-16 md:p-8">
              <div className="flex flex-col items-center justify-between gap-6 sm:flex-row text-center sm:text-left">
                {/* Note icon + copy */}
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                  <svg
                    className="h-9 w-9 md:h-11 md:w-11 text-[#D8006E] shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gray-900 md:text-xl">
                      Not sure which class is right for you?
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 md:text-sm">
                      Contact us and our team will help you choose the best option.
                    </p>
                  </div>
                </div>

                {/* Contact Us button */}
                <Link
                  href="/contact"
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#D8006E] px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#C20063] hover:shadow-md"
                >
                  Contact Us &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
