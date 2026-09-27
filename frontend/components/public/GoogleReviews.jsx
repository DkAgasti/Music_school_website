"use client";

import { useEffect, useState } from "react";

const AUTO_SCROLL_INTERVAL_MS = 5000;

const GOOGLE_MAPS_URL = "https://www.google.com/search?q=Synchrocity+Music+Scho&rlz=1C5GCEM_enIN1222IN1222&oq=Synchrocity+Music+Scho&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTINCAEQLhivARjHARiABDIHCAIQABiABDIICAMQABgWGB4yCAgEEAAYFhgeMgYIBRBFGDwyBggGEEUYPDIGCAcQRRg90gEHMzE5ajBqN6gCALACAA&sourceid=chrome&source=chrome.ob&ie=UTF-8#lrd=0x3a190a0a6f185651:0x97bf542480b34638,3,,,,";

const REVIEWS = [
  {
    name: "Dhruvaditya Mishra",
    date: "a year ago",
    rating: 5,
    text: "One of the best school. Yogesh sir is our favorite. This Institute never considers music as business. Their first priority is to make students learn music. My son just waits for the weekend to join drum classes.",
  },
  {
    name: "Shuvarthi Das Nishtha",
    date: "8 months ago",
    rating: 5,
    text: "Best music school for singing classes, Sandeep sir's teaching style was awesome. Highly recommended!",
  },
  {
    name: "Jagadish Sahoo",
    date: "3 weeks ago",
    rating: 5,
    text: "Best Music School In Bbsr.",
  },
  {
    name: "Tanmay Sekhar",
    date: "8 years ago",
    rating: 5,
    text: "A fabulous school to learn music as I have experienced. The teachers who help us learn music are very friendly. I have gained knowledge much more than before, starting from the basics to intermediate. The ambience is far too pleasing along with the school mates and teachers.",
  },
  {
    name: "Nutana Abhinandita",
    date: "8 years ago",
    rating: 5,
    text: "I am absolutely blown away by this amazing institute!! Really a great curriculum and teachers are very friendly & talented. Definitely I would like to say this is an awesome music school ever in Bhubaneswar!!",
  },
  {
    name: "Riya Das",
    date: "4 years ago",
    rating: 5,
    text: "As an absolute beginner, I am thoroughly enjoying the classes. Great explanation and lot of patience in teaching. Highly recommended for all those who are planning to start playing Guitar.",
  },
];

function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5h-1.9V20.4H24v7.2h11.3c-1.6 4.5-5.9 7.6-11.3 7.6-6.9 0-12.4-5.6-12.4-12.4s5.6-12.4 12.4-12.4c3.2 0 6 1.2 8.2 3.1l5.1-5.1C34.7 5.4 29.6 3.2 24 3.2 12.6 3.2 3.2 12.6 3.2 24S12.6 44.8 24 44.8 44.8 35.4 44.8 24c0-1.2-.1-2.4-.3-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6 4.4C13.9 15.5 18.6 12.6 24 12.6c3.2 0 6 1.2 8.2 3.1l5.1-5.1C34.7 7.4 29.6 5.2 24 5.2c-7.6 0-14.1 4.3-17.7 9.5z"
      />
      <path
        fill="#4CAF50"
        d="M24 44.8c5.5 0 10.5-2.1 14.2-5.6l-6.6-5.4c-2 1.5-4.6 2.4-7.6 2.4-5.4 0-9.9-3.6-11.5-8.6l-6.5 5c3.5 7 10.7 12.2 18 12.2z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H24v7.2h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.4c3.9-3.6 6.4-8.9 6.4-14.7 0-1.2-.1-2.4-.6-3.5z"
      />
    </svg>
  );
}

function Stars({ count, className = "h-4 w-4", color = "text-brand-500" }) {
  return (
    <div className={`flex gap-0.5 ${color}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${className} ${s <= count ? "fill-current" : "fill-gray-200"}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function GoogleBusinessCard() {
  return (
    <a
      href={GOOGLE_MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
    >
      Review us on <GoogleIcon className="h-5 w-5" />
    </a>
  );
}

export default function GoogleReviews() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const review = REVIEWS[index];

  function goPrev() {
    setDirection(-1);
    setIndex((i) => (i - 1 + REVIEWS.length) % REVIEWS.length);
  }

  function goNext() {
    setDirection(1);
    setIndex((i) => (i + 1) % REVIEWS.length);
  }

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % REVIEWS.length);
    }, AUTO_SCROLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      <span className="absolute -top-4 left-6 text-4xl text-brand-300 select-none">&ldquo;</span>

      <div key={index} className={direction === 1 ? "animate-slide-in-right" : "animate-slide-in-left"}>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 italic">{review.text}</p>

        <p className="mt-4 text-sm font-semibold text-dark">&mdash; {review.name}</p>
        <p className="text-xs text-gray-400">Google Review &middot; {review.date}</p>

        <div className="mt-4 flex items-center justify-between">
          <Stars count={review.rating} />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous review"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-brand-50 hover:text-brand-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next review"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-brand-50 hover:text-brand-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(28px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-28px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.45s ease-out;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.45s ease-out;
        }
      `}</style>
    </div>
  );
}
