import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900">About Us</h1>
        <p className="mt-4 text-gray-600">
          Music School has been nurturing musicians for years with a focus on personalized,
          small-batch teaching across vocal and instrumental disciplines.
        </p>
      </main>
      <Footer />
    </>
  );
}
