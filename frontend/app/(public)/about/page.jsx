import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export const metadata = {
  title: "About Us - Harmony Music School",
  description:
    "At Harmony Music School, we believe in the power of music to inspire, build confidence, and create a lifelong passion.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-800 antialiased">
      <Navbar />

      <main className="flex-1">
        {/* ── 1. Hero / Intro Section ────────────────────────────────────────── */}
        <section className="relative w-full overflow-hidden bg-white pt-0 pb-8 sm:pb-10 md:pb-12">
          {/* Constrained container for text (tablet/desktop only) */}
          <div className="hidden md:block mx-auto max-w-6xl px-5 sm:px-6">
            <div className="grid items-center gap-6 md:grid-cols-12 md:gap-8 md:min-h-[290px] lg:min-h-[305px]">
              {/* Left text column */}
              <div className="md:col-span-6 lg:col-span-5 md:py-8 z-10">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-gray-900 leading-tight">
                  About Us
                </h1>
                <h2 className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-2 sm:mt-3">
                  More Than Just Music
                </h2>
                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-gray-600 max-w-md">
                  At Harmony Music School, we believe in the power of music to
                  inspire, build confidence, and create a lifelong passion. Our
                  mission is to provide high-quality, personalized music education
                  in a supportive and creative environment.
                </p>
              </div>

              {/* Desktop grid spacer so text doesn't overlap image */}
              <div className="hidden md:block md:col-span-6 lg:col-span-7" />
            </div>
          </div>

          {/* Right image: completely flush to top navbar (top-0) and right edge of screen (right-0), visibly shorter height (tablet/desktop only) */}
          <div className="hidden md:block md:absolute md:top-0 md:right-0 md:w-[50%] lg:w-[48%] xl:w-[46%] md:h-[285px] lg:h-[300px] overflow-hidden">
            <div className="relative h-full w-full overflow-hidden md:rounded-bl-[40px]">
              <img
                src="https://res.cloudinary.com/vpetrpeu/image/upload/v1789893089/ChatGPT_Image_Sep_14_2026_01_06_58_PM.png"
                alt="Student playing acoustic guitar at Harmony Music School"
                className="h-full w-full object-cover object-[72%_center] select-none pointer-events-none"
              />
              {/* Soft gradient fade on the left to smoothly blend into page background */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-2/5 sm:w-1/3 bg-gradient-to-r from-white via-white/80 to-transparent" />
            </div>
          </div>

          {/* Mobile: full-width image with text overlaid directly on it */}
          <div className="md:hidden relative h-[280px] sm:h-[320px] w-full overflow-hidden">
            <img
              src="https://res.cloudinary.com/vpetrpeu/image/upload/v1789893089/ChatGPT_Image_Sep_14_2026_01_06_58_PM.png"
              alt="Student playing acoustic guitar at Harmony Music School"
              className="absolute inset-0 h-full w-full object-cover object-[72%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-5 pb-5 sm:px-8 sm:pb-6">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                About Us
              </h1>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white/95 mt-1.5">
                More Than Just Music
              </h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-white/90 max-w-md">
                At Harmony Music School, we believe in the power of music to
                inspire, build confidence, and create a lifelong passion.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 sm:px-6 py-4 sm:py-6">
          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
            {/* Card 1: Our Story */}
            <div className="relative flex flex-col justify-start rounded-2xl sm:rounded-3xl bg-[#FDEEF4] p-7 sm:p-9 border border-pink-200/60 shadow-xs">
              {/* Top pink accent bar */}
              <div className="h-1 w-14 rounded-full bg-brand-500 mb-6" />

              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-pink-100 text-brand-500 shadow-xs mb-5">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Our Story
              </h3>
              <p className="text-sm sm:text-[14.5px] leading-relaxed text-gray-600">
                Founded in 2015, Harmony Music School started with a simple
                belief &ndash; that music can change lives. Over the years, we
                have grown into a trusted learning center, helping hundreds of
                students discover and develop their musical talents.
              </p>
            </div>

            <div className="relative flex flex-col justify-start rounded-2xl sm:rounded-3xl bg-white p-7 sm:p-9 border border-gray-100 shadow-sm">
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50/90 border border-pink-100 text-brand-500 mb-6">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Our Mission &amp; Philosophy
              </h3>
              <p className="text-sm sm:text-[14.5px] leading-relaxed text-gray-600">
                Our mission is to nurture creativity, confidence and a lifelong
                love for music through expert guidance, personalized training and
                a supportive community.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 sm:px-6 pt-12 pb-8 sm:pt-16 sm:pb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-10">
            Our Achievements
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            <div className="flex items-center gap-3.5 sm:gap-4 rounded-2xl bg-white p-5 sm:p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-pink-50 border border-pink-100/80 text-brand-500 shrink-0">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  10+
                </div>
                <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  Years of Excellence
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 sm:gap-4 rounded-2xl bg-white p-5 sm:p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-pink-50 border border-pink-100/80 text-brand-500 shrink-0">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  500+
                </div>
                <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  Happy Students
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 sm:gap-4 rounded-2xl bg-white p-5 sm:p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-pink-50 border border-pink-100/80 text-brand-500 shrink-0">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  20+
                </div>
                <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  Expert Teachers
                </div>
              </div>
            </div>

            {/* Stat 4: 100% Satisfaction */}
            <div className="flex items-center gap-3.5 sm:gap-4 rounded-2xl bg-white p-5 sm:p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-pink-50 border border-pink-100/80 text-brand-500 shrink-0">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  100%
                </div>
                <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  Student Satisfaction
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative bg-[#FFF7FB] pt-8 pb-8 sm:pt-10 sm:pb-10 min-h-[480px] lg:min-h-[515px] flex items-center overflow-hidden">
          {/* Desktop Cello Player Illustration (Absolute full-height aligned right) */}
          <div className="hidden lg:block absolute -top-3 bottom-0 right-0 w-[65%] xl:w-[68%] 2xl:w-[70%] h-full pointer-events-none select-none z-0">
            <img
              src="https://res.cloudinary.com/vpetrpeu/image/upload/v1789901632/aboutpage.png"
              alt="Cello player illustration"
              className="h-full w-full object-contain object-right"
            />
          </div>

          <div className="mx-auto max-w-6xl w-full px-5 sm:px-6 relative z-10">
            <div className="max-w-md lg:max-w-lg">
              <h2 className="font-serif text-3xl sm:text-[34px] lg:text-[38px] font-bold text-gray-900 mb-8 sm:mb-9">
                Why Choose Us
              </h2>

              <div className="space-y-6 sm:space-y-7">
                {/* Item 1: Experienced & Qualified Teachers */}
                <div className="flex items-center gap-4 group">
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#FDEBF5] border border-[#FADCEB] text-[#E11D48] shrink-0 shadow-xs transition-transform group-hover:scale-105">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    Experienced &amp; Qualified Teachers
                  </span>
                </div>

                {/* Item 2: Personalized Learning Approach */}
                <div className="flex items-center gap-4 group">
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#FDEBF5] border border-[#FADCEB] text-[#E11D48] shrink-0 shadow-xs transition-transform group-hover:scale-105">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.5 12l2.5 2.5 4.5-5"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    Personalized Learning Approach
                  </span>
                </div>

                {/* Item 3: Modern Facilities & Instruments */}
                <div className="flex items-center gap-4 group">
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#FDEBF5] border border-[#FADCEB] text-[#E11D48] shrink-0 shadow-xs transition-transform group-hover:scale-105">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 12l9-8 9 8M5 10.5V20a1 1 0 001 1h12a1 1 0 001-1V10.5"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.5 21v-5a1 1 0 011-1h3a1 1 0 011 1v5"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    Modern Facilities &amp; Instruments
                  </span>
                </div>

                {/* Item 4: Regular Performance Opportunities */}
                <div className="flex items-center gap-4 group">
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#FDEBF5] border border-[#FADCEB] text-[#E11D48] shrink-0 shadow-xs transition-transform group-hover:scale-105">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    Regular Performance Opportunities
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile / Tablet Cello Illustration (Stacked below) */}
            <div className="mt-10 flex justify-center lg:hidden">
              <img
                src="https://res.cloudinary.com/vpetrpeu/image/upload/v1789901632/aboutpage.png"
                alt="Cello player illustration"
                className="w-full max-w-lg h-auto object-contain pointer-events-none select-none"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer theme="light" />
    </div>
  );
}
