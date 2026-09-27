"use client";

import { useEffect, useState } from "react";
import { cloudinaryThumb } from "@/lib/cloudinary";

const CARD_STYLE = {
  0: { x: 0, y: 0, rot: 0, scale: 1, z: 30, opacity: 1, w: 230, h: 320 },
  1: { x: 190, y: 26, rot: 8, scale: 0.88, z: 20, opacity: 1, w: 190, h: 280 },
  2: { x: 350, y: 55, rot: 15, scale: 0.78, z: 10, opacity: 0.85, w: 160, h: 240 },
};

function getOffset(index, current, length) {
  let diff = index - current;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff;
}

export default function GalleryFan({ images }) {
  const [current, setCurrent] = useState(0);
  const length = images.length;

  useEffect(() => {
    if (length < 2) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % length);
    }, 5000);
    return () => clearInterval(timer);
  }, [length]);

  if (length === 0) return null;

  const active = images[current];

  const goTo = (index) => setCurrent(((index % length) + length) % length);
  const goPrev = () => goTo(current - 1);
  const goNext = () => goTo(current + 1);

  return (
    <div className="mt-2">
      <div className="text-center">
        <h3 className="font-serif text-2xl font-bold text-dark">
          {active.caption || "From the Collection"}
        </h3>
        {active.category && (
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-gray-400">
            {active.category}
          </p>
        )}
      </div>

      <div className="relative mx-auto mt-10 h-[280px] max-w-4xl overflow-hidden sm:h-[340px] sm:overflow-visible md:h-[400px]">
        {/* soft glow behind the center card */}
        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-200/40 blur-3xl" />

        {images.map((img, index) => {
          const rawOffset = getOffset(index, current, length);
          const absOffset = Math.abs(rawOffset);
          if (absOffset > 2) return null;

          const base = CARD_STYLE[absOffset];
          const sign = rawOffset < 0 ? -1 : 1;
          const isCenter = rawOffset === 0;

          return (
            <button
              key={img.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={img.caption || `Gallery image ${index + 1}`}
              className={`absolute left-1/2 top-1/2 overflow-hidden rounded-2xl bg-brand-50 shadow-xl ring-1 ring-black/5 transition-all duration-500 ease-out ${
                isCenter ? "cursor-default shadow-2xl" : "cursor-pointer"
              } ${absOffset === 2 ? "hidden sm:block" : ""}`}
              style={{
                width: base.w,
                height: base.h,
                zIndex: base.z,
                opacity: base.opacity,
                transform: `translate(-50%, -50%) translateX(${
                  sign * base.x
                }px) translateY(${base.y}px) rotate(${sign * base.rot}deg) scale(${base.scale})`,
              }}
            >
              <img
                src={cloudinaryThumb(img.url, 460)}
                alt={img.caption || ""}
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous image"
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-500 text-brand-500 transition-colors hover:bg-brand-50 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {images.slice(0, Math.min(length, 8)).map((img, index) => (
            <span
              key={img.id}
              className={`h-2 rounded-full transition-all ${
                index === current ? "w-6 bg-brand-500" : "w-2 bg-brand-200"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next image"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm transition-colors hover:bg-brand-600 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
