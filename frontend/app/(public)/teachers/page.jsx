import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import TeachersClient from "./TeachersClient";

export const metadata = {
  title: "Our Teachers - Synchrocity Music School",
  description:
    "Learn from passionate and experienced music instructors at Synchrocity Music School.",
};

export default function TeachersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9FA]">
      <Navbar />
      <div className="flex-1">
        <TeachersClient />
      </div>
      <Footer theme="light" />
    </div>
  );
}
