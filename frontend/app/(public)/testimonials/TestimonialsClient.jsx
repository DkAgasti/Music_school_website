"use client";

import { useEffect, useState } from "react";
import TestimonialCard from "@/components/public/TestimonialCard";
import { apiGetTestimonials } from "@/Api/public/testimonialApi";

export default function TestimonialsClient() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    apiGetTestimonials().then((res) => setTestimonials(res || []));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
      {testimonials.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-500">
          No testimonials found yet.
        </p>
      )}
    </main>
  );
}
