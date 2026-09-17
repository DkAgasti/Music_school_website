import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import TestimonialCard from "@/components/public/TestimonialCard";
import { getTestimonials } from "@/lib/api";

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials().catch(() => []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
