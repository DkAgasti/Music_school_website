import Link from "next/link";
import FloatingNotes from "./FloatingNotes";

export default function Hero() {
  return (
    <section className="relative min-h-[670px] overflow-hidden bg-[#fdf2f8]">
      <FloatingNotes />
      <span className="absolute left-[48%] top-8 z-20 text-3xl text-brand-400 select-none">
        &#9835;
      </span>

      <span className="absolute left-[54%] top-16 z-20 text-2xl text-brand-300 select-none">
        &#9834;
      </span>

      <div className="relative mx-auto min-h-[670px] max-w-6xl px-5">
        {/* Left copy */}
        <div className="relative z-20 max-w-xl py-24 lg:py-28">
          <h1 className="font-serif text-4xl font-bold leading-tight text-dark md:text-5xl lg:text-[3.4rem]">
            Where Music
            <br />
            Builds <span className="text-brand-500">Better Lives</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-gray-600">
            Professional music education for all ages. Learn from experienced
            teachers, grow your skills, and be part of a creative community.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/admission"
              className="rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Join Admission
            </Link>

            <Link
              href="/classes"
              className="rounded-full border-2 border-brand-500 px-7 py-3 text-sm font-semibold text-brand-500 transition-colors hover:bg-brand-500 hover:text-white"
            >
              Explore Classes
            </Link>
          </div>

          {/* Feature badges */}
          <div className="mt-12 flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm font-semibold text-dark">
                  Expert Teachers
                </p>
                <p className="text-xs text-gray-400">&amp; Mentors</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-500">
                <span className="text-lg">&#9835;</span>
              </div>

              <div>
                <p className="text-sm font-semibold text-dark">Wide Range</p>
                <p className="text-xs text-gray-400">of Instruments</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011 1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm font-semibold text-dark">
                  Modern &amp; Spacious
                </p>
                <p className="text-xs text-gray-400">Facilities</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT HERO IMAGE */}
        <div className="pointer-events-none absolute bottom-[1px] right-[-250px] hidden lg:block">
          {/* Background MUSIC text */}
          <span className="absolute left-[-280px] top-[150px] whitespace-nowrap font-serif text-[11rem] font-bold italic leading-none text-gray-200/60 select-none">
            MUSIC
          </span>

          <img
            src="https://res.cloudinary.com/fexwwils/image/upload/v1789578707/Music_hero.png"
            alt="Guitar"
            className="relative z-10 block h-[650px] w-auto max-w-none object-contain"
          />
        </div>
      </div>
    </section>
  );
}