import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import Hero from "@/components/public/Hero";
import ClassCard from "@/components/public/ClassCard";
import HomeTeachersGrid from "@/components/public/HomeTeachersGrid";
import GoogleReviews, { GoogleBusinessCard } from "@/components/public/GoogleReviews";
import StatsBar from "@/components/public/StatsBar";
import AdmissionNowButton from "@/components/public/AdmissionNowButton";
import { apiGetClasses } from "@/Api/public/classApi";
import { apiGetTeachers } from "@/Api/public/teacherApi";
import { apiGetGalleryImages } from "@/Api/public/galleryApi";

export const metadata = {
  description:
    "Synchrocity Music School offers expert-led guitar, piano, vocals, violin, drums and tabla classes for all ages. Book a free trial class today.",
};

export default async function HomePage() {
  const [classesRes, teachersRes, galleryImagesRes] = await Promise.all([
    apiGetClasses(),
    apiGetTeachers(),
    apiGetGalleryImages(),
  ]);

  const classes = classesRes || [];
  const teachers = teachersRes || [];
  const galleryImages = galleryImagesRes || [];

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

            {classes.length > 0 ? (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {classes.slice(0, 4).map((musicClass) => (
                  <ClassCard key={musicClass.id} musicClass={musicClass} />
                ))}
              </div>
            ) : (
              <p className="mt-10 text-center text-sm text-gray-500">
                No classes found yet.
              </p>
            )}
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

                {teachers.length > 0 ? (
                  <HomeTeachersGrid teachers={teachers.slice(0, 4)} />
                ) : (
                  <p className="mt-8 text-sm text-gray-500">
                    No teachers found yet.
                  </p>
                )}
              </div>

              {/* Testimonials — takes 2 cols */}
              <div className="lg:col-span-2">
                <h2 className="font-serif text-3xl font-bold text-dark">
                  What Our Students Say
                </h2>

                <div className="mt-8">
                  <GoogleReviews />
                </div>

                <div className="mt-5">
                  <GoogleBusinessCard />
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

            {galleryImages.length > 0 ? (
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
            ) : (
              <p className="mt-8 text-sm text-gray-500">
                No gallery images found yet.
              </p>
            )}
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
            <AdmissionNowButton className="shrink-0 rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 cursor-pointer">
              Admission Now &rarr;
            </AdmissionNowButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
