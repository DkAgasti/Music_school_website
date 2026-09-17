import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import Hero from "@/components/public/Hero";
import ClassCard from "@/components/public/ClassCard";
import TeacherCard from "@/components/public/TeacherCard";
import TestimonialCard from "@/components/public/TestimonialCard";
import StatsBar from "@/components/public/StatsBar";
import { getClasses, getTeachers, getTestimonials, getGalleryImages } from "@/lib/api";

export default async function HomePage() {
  const [classes, teachers, testimonials, galleryImages] = await Promise.all([
    getClasses().catch(() => []),
    getTeachers().catch(() => []),
    getTestimonials().catch(() => []),
    getGalleryImages().catch(() => []),
  ]);

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <Hero />

        {/* ── Popular Music Classes ────────────────────────────── */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-dark md:text-4xl">
                Popular Music Classes
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
                Explore our wide range of music classes designed for all skill
                levels.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {classes.map((musicClass) => (
                <ClassCard key={musicClass.id} musicClass={musicClass} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────── */}
        <StatsBar />

        {/* ── Teachers + Testimonials ──────────────────────────── */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid gap-12 lg:grid-cols-5">
              {/* Teachers — takes 3 cols */}
              <div className="lg:col-span-3">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-dark">
                      Meet Our Teachers
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      Learn from talented artists and experienced instructors.
                    </p>
                  </div>
                  <Link
                    href="/teachers"
                    className="hidden text-sm font-semibold text-brand-500 transition-colors hover:text-brand-600 sm:inline"
                  >
                    View All Teachers &rarr;
                  </Link>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
                  {teachers.slice(0, 4).map((teacher) => (
                    <TeacherCard key={teacher.id} teacher={teacher} />
                  ))}
                </div>
              </div>

              {/* Testimonials — takes 2 cols */}
              <div className="lg:col-span-2">
                <h2 className="font-serif text-3xl font-bold text-dark">
                  What Our Students Say
                </h2>

                <div className="mt-8 space-y-5">
                  {testimonials.slice(0, 2).map((t) => (
                    <TestimonialCard key={t.id} testimonial={t} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Gallery ──────────────────────────────────────────── */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-serif text-3xl font-bold text-dark">
                  Our Gallery
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Moments from classes, recitals, and events.
                </p>
              </div>
              <Link
                href="/gallery"
                className="text-sm font-semibold text-brand-500 transition-colors hover:text-brand-600"
              >
                View All &rarr;
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {galleryImages.slice(0, 4).map((img) => (
                <div
                  key={img.id}
                  className="aspect-[4/3] overflow-hidden rounded-xl bg-brand-50"
                >
                  <img
                    src={img.url}
                    alt={img.caption ?? ""}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="bg-brand-50 py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <h2 className="font-serif text-2xl font-bold text-dark md:text-3xl">
                Ready to Start Your Musical Journey?
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Join our classes and be part of a growing musical community.
              </p>
            </div>
            <Link
              href="/admission"
              className="shrink-0 rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Admission Now &rarr;
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
