import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import ClassesClient from "./ClassesClient";

export const metadata = {
  title: "Our Classes - Synchrocity Music School",
  description:
    "Explore guitar, piano, vocals, violin, drums and tabla classes at Synchrocity Music School — flexible batches and experienced faculty.",
};

export default function ClassesPage() {
  return (
    <>
      <Navbar />
      <ClassesClient />
      <Footer />
    </>
  );
}
