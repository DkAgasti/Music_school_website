"use client";

import { useState } from "react";
import { cloudinaryThumb } from "@/lib/cloudinary";

const PAGE_SIZE = 12;

export default function GalleryCollectionGrid({ images }) {
  const [visibleCount, setVisibleCount] = useState(Math.min(PAGE_SIZE, images.length));

  const visible = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  return (
    <>
      <div className="mt-10 columns-2 gap-4 sm:columns-3 md:columns-4">
        {visible.map((img) => (
          <div
            key={img.id}
            className="group mb-4 break-inside-avoid overflow-hidden rounded-xl bg-brand-50"
          >
            <img
              src={cloudinaryThumb(img.url, 480)}
              alt={img.caption ?? ""}
              loading="lazy"
              decoding="async"
              className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, images.length))}
            className="rounded-full border-2 border-brand-500 px-7 py-3 text-sm font-semibold text-brand-500 transition-colors hover:bg-brand-500 hover:text-white cursor-pointer"
          >
            Load More ({images.length - visibleCount} more)
          </button>
        </div>
      )}
    </>
  );
}
