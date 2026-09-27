import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import ShopCatalog from "@/components/public/ShopCatalog";

export const metadata = {
  title: "Shop - Synchrocity Music School",
  description: "Quality instruments and books for your musical journey, from Synchrocity Music School.",
};

export default function ShopPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FFF7F9]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
          {/* Heading */}
          <h1 className="font-serif text-4xl font-bold text-gray-900 sm:text-[42px]">
            Shop
          </h1>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Quality instruments and books for your musical journey.
          </p>

          {/* Filters + product grid + sidebar */}
          <div className="mt-8">
            <ShopCatalog />
          </div>

          {/* Quote banner */}
          <div className="relative mt-12 overflow-hidden rounded-2xl border border-pink-100/70 bg-[#FDEEF2] px-6 py-10 sm:mt-16 sm:px-10">
            <svg
              className="absolute left-6 top-6 h-6 w-6 text-[#E11D48]/50"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <svg
              className="absolute bottom-6 right-8 h-6 w-6 text-[#E11D48]/50"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <svg
              className="pointer-events-none absolute bottom-0 right-0 h-24 w-40 text-[#E11D48]/20"
              viewBox="0 0 160 100"
              fill="none"
            >
              <path
                d="M0 90 Q 60 20 160 60"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>

            <p className="mx-auto max-w-xl text-center font-serif text-lg italic leading-relaxed text-[#E11D48] sm:text-xl">
              &ldquo;Great teachers don&rsquo;t just teach music, they inspire a lifelong love for it.&rdquo;
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
