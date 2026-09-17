import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import TeacherCard from "@/components/public/TeacherCard";
import { getTeachers } from "@/lib/api";

export default async function TeachersPage() {
  const teachers = await getTeachers().catch(() => []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Our Teachers</h1>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
