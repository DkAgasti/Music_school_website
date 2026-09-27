import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import HomeClient from "./HomeClient";

export const metadata = {
  description:
    "Synchrocity Music School offers expert-led guitar, piano, vocals, violin, drums and tabla classes for all ages. Book a free trial class today.",
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HomeClient />
      <Footer />
    </>
  );
}
