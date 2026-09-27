import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import TestimonialsClient from "./TestimonialsClient";

export const metadata = {
  title: "Testimonials - Synchrocity Music School",
  description: "See what students and parents say about their experience at Synchrocity Music School.",
};

export default function TestimonialsPage() {
  return (
    <>
      <Navbar />
      <TestimonialsClient />
      <Footer />
    </>
  );
}
