"use client";

import { useState } from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { submitEnquiry } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitEnquiry(form);
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {/* ── 1. Hero Banner Section ───────────────────────────── */}
        <section className="relative w-full overflow-hidden bg-white pt-0 pb-0">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="grid items-center gap-6 md:grid-cols-12 md:gap-8 min-h-[190px] sm:min-h-[210px] md:min-h-[230px]">
              {/* Left text column */}
              <div className="md:col-span-7 lg:col-span-6 py-6 sm:py-8 z-10">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-gray-900 leading-tight">
                  Contact Us
                </h1>
                <p className="mt-3 text-xs sm:text-sm md:text-base leading-relaxed text-gray-500 max-w-md">
                  We&apos;d love to hear from you.
                </p>
              </div>

              {/* Desktop grid spacer */}
              <div className="hidden md:block md:col-span-5 lg:col-span-6" />
            </div>
          </div>

          {/* Right gradient glow flush to right edge */}
          <div className="md:absolute md:top-0 md:bottom-0 md:right-0 w-full md:w-[50%] lg:w-[48%] xl:w-[46%] h-[160px] sm:h-[180px] md:h-full overflow-hidden px-4 sm:px-6 md:px-0">
            <div className="relative h-full w-full overflow-hidden">
              <img
                src="/images/contact/hero-glow.png"
                alt=""
                className="h-full w-full object-cover object-right select-none pointer-events-none"
              />
            </div>
          </div>
        </section>

        {/* ── 2. Main Contact Form & Details Section ───────────── */}
        <section className="bg-[#FFF7F9] pt-8 pb-14 sm:pt-10 sm:pb-16 md:pt-12 md:pb-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            {/* Two-tone Card with Guitar Illustration */}
            <div className="relative overflow-hidden rounded-3xl border border-pink-100/70 bg-[#FDF8FA] shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* ── Left: Get in Touch ── */}
                <div className="p-7 sm:p-9 md:p-11 lg:col-span-5 flex flex-col justify-between z-10">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
                      Get in Touch
                    </h2>

                    <div className="space-y-6">
                      {/* Phone */}
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100/70 text-[#D8006E]">
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
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 leading-tight">
                            Phone
                          </h3>
                          <a
                            href="tel:+919876543210"
                            className="mt-1 block text-xs sm:text-sm text-gray-500 hover:text-[#D8006E] transition-colors"
                          >
                            +91 98765 43210
                          </a>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100/70 text-[#D8006E]">
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
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 leading-tight">
                            Email
                          </h3>
                          <a
                            href="mailto:info@harmonymusic.in"
                            className="mt-1 block text-xs sm:text-sm text-gray-500 hover:text-[#D8006E] transition-colors"
                          >
                            info@harmonymusic.in
                          </a>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100/70 text-[#D8006E]">
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
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <circle cx="12" cy="11" r="3" strokeWidth={1.8} />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 leading-tight">
                            Address
                          </h3>
                          <p className="mt-1 text-xs sm:text-sm text-gray-500 leading-relaxed">
                            123 Music Lane, Green Park
                            <br />
                            New Delhi – 110016
                          </p>
                        </div>
                      </div>

                      {/* Follow Us */}
                      <div className="flex items-start gap-4 pt-1">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100/70 text-[#D8006E]">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <rect
                              x="2"
                              y="2"
                              width="20"
                              height="20"
                              rx="5"
                              strokeWidth={1.8}
                            />
                            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 leading-tight">
                            Follow Us
                          </h3>
                          <div className="mt-2.5 flex items-center gap-2.5">
                            {/* Facebook */}
                            <a
                              href="https://facebook.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Facebook"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-all hover:bg-[#D8006E] hover:scale-105"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                              </svg>
                            </a>

                            {/* YouTube */}
                            <a
                              href="https://youtube.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="YouTube"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-all hover:bg-[#D8006E] hover:scale-105"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                              </svg>
                            </a>

                            {/* Instagram */}
                            <a
                              href="https://instagram.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Instagram"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-all hover:bg-[#D8006E] hover:scale-105"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Center: Guitar Illustration ── */}

                <div
                  className="pointer-events-none absolute top-1/2 z-20 hidden lg:block h-[92%] xl:h-[96%] max-h-[500px] w-auto"
                  style={{ left: "41.667%", transform: "translate(-37%, -50%)" }}
                >
                  <img
                    src="https://res.cloudinary.com/vpetrpeu/image/upload/e_trim/v1789893088/contact_guiter.png"
                    alt="Acoustic Guitar Accent"
                    className="h-full w-auto object-contain select-none"
                  />
                </div>

                {/* ── Right: Send Us a Message (Shifted right to give clear clearance from guitar) ── */}
                <div className="bg-[#191A1E] p-7 sm:p-9 md:p-11 lg:p-12 lg:pl-48 xl:pl-56 lg:col-span-7 flex flex-col justify-center rounded-3xl lg:rounded-none lg:rounded-r-3xl z-10">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-6">
                    Send Us a Message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Your Name *"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="w-full rounded-xl bg-[#23242A] border border-[#34363F] px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-[#D8006E] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Email Address *"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="w-full rounded-xl bg-[#23242A] border border-[#34363F] px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-[#D8006E] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number *"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        className="w-full rounded-xl bg-[#23242A] border border-[#34363F] px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-[#D8006E] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <textarea
                        required
                        rows={4}
                        placeholder="Your Message *"
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        className="w-full rounded-xl bg-[#23242A] border border-[#34363F] px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-[#D8006E] focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full rounded-xl bg-[#BE185D] py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#A2134E] hover:shadow-md disabled:opacity-60"
                    >
                      {status === "submitting" ? "Sending..." : "Send Message"}
                    </button>

                    {status === "success" && (
                      <p className="text-center text-sm font-medium text-emerald-400 pt-1">
                        Thank you! Your message has been sent successfully.
                      </p>
                    )}
                    {status === "error" && (
                      <p className="text-center text-sm font-medium text-rose-400 pt-1">
                        Something went wrong. Please try again.
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* ── 3. Find Us on Map Section ─────────────────────── */}
            <div className="mt-14 sm:mt-18 md:mt-20">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
                Find Us on Map
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left: Map Card */}
                <div className="lg:col-span-7 overflow-hidden rounded-2xl border border-pink-100/60 shadow-xs bg-white">
                  <a
                    href="https://maps.google.com/?q=Harmony+Music+School+Green+Park+New+Delhi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block h-full w-full relative"
                  >
                    <img
                      src="/images/contact/map-preview.png"
                      alt="Harmony Music School on Google Maps"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </a>
                </div>

                {/* Right: Our Location Card */}
                <div className="lg:col-span-5 flex flex-col justify-center rounded-2xl bg-white p-7 sm:p-9 border border-pink-100/60 shadow-xs">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                    Our Location
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-gray-500 leading-relaxed">
                    123 Music Lane, Green Park
                    <br />
                    New Delhi – 110016
                  </p>
                  <div className="mt-6">
                    <a
                      href="https://maps.google.com/?q=123+Music+Lane+Green+Park+New+Delhi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl border border-[#D8006E] px-6 py-2.5 text-xs sm:text-sm font-semibold text-[#D8006E] transition-colors hover:bg-pink-50"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
