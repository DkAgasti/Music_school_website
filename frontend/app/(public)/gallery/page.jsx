import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import GalleryClient from "./GalleryClient";

export const metadata = {
  title: "Gallery - Synchrocity Music School",
  description: "Photos from recitals, classes, and events at Synchrocity Music School.",
};

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <GalleryClient />
      <Footer />
    </>
  );
}
