import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { getTeachers } from "@/lib/api";
import TeachersClient from "./TeachersClient";

export const metadata = {
  title: "Our Teachers - Harmony Music School",
  description:
    "Learn from passionate and experienced music instructors at Harmony Music School.",
};

export default async function TeachersPage() {
  const teachers = await getTeachers().catch(() => []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9FA]">
      <Navbar />
      <div className="flex-1">
        <TeachersClient teachers={teachers} />
      </div>
      <Footer theme="light" />
    </div>
  );
}
