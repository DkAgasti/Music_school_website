"use client";

import { useEffect, useState } from "react";
import GalleryFan from "@/components/public/GalleryFan";
import GalleryCollectionGrid from "@/components/public/GalleryCollectionGrid";
import { apiGetGalleryImages } from "@/Api/public/galleryApi";

export default function GalleryClient() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    apiGetGalleryImages().then((res) => setImages(res || []));
  }, []);

  const featured = images.slice(0, 8);

  return (
    <main className="bg-[#f8f6f3]">
      {/* ── Hero + Fan Showcase ──────────────────────────────── */}
      <section className="pt-14 pb-16 sm:pt-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <h1 className="font-serif text-4xl font-bold leading-tight text-dark md:text-5xl">
              Drive into
              <br />
              creativity with our
              <br />
              <span className="font-script text-5xl font-normal text-brand-500 md:text-6xl">
                gallery collection
              </span>
            </h1>

            <div className="max-w-xs md:pt-2 md:text-right">
              <p className="text-sm leading-relaxed text-gray-500">
                Explore our curated gallery collection, featuring captivating
                works from renowned artists, and immerse yourself in
                upcoming exhibitions and events that celebrate creativity.
              </p>
              <a
                href="#full-collection"
                className="mt-5 inline-block rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 md:ml-auto"
              >
                Explore Collection
              </a>
            </div>
          </div>

          {featured.length > 0 ? (
            <GalleryFan images={featured} />
          ) : (
            <p className="mt-16 text-center text-sm text-gray-500">
              No gallery images found yet.
            </p>
          )}
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────── */}
      <section className="border-t border-black/5 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-8 md:grid-cols-[220px_1fr] md:gap-16">
            <h2 className="font-serif text-3xl font-bold leading-none text-dark">
              About the
              <br />
              <span className="font-script text-4xl font-normal text-brand-500">
                gallery
              </span>
            </h2>

            <p className="max-w-2xl text-sm leading-relaxed text-gray-500 md:text-base">
              <span className="font-semibold text-dark">
                Welcome to our gallery, where creativity thrives.
              </span>{" "}
              We showcase diverse collections, from timeless classics to
              contemporary art, connecting artists and audiences through
              inspiring exhibitions. Explore our gallery, discover our
              collections, and join us for upcoming events, workshops, and
              artist talks. Experience the beauty and stories that art
              brings to life.
            </p>
          </div>
        </div>
      </section>

      {/* ── Full Collection ──────────────────────────────────── */}
      {images.length > 0 && (
        <section id="full-collection" className="border-t border-black/5 bg-white py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-dark">
                Full Collection
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
                Browse every moment we&apos;ve captured, from classes to
                recitals and events.
              </p>
            </div>

            <GalleryCollectionGrid images={images} />
          </div>
        </section>
      )}
    </main>
  );
}
