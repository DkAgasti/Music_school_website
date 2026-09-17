import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import ClassCard from "@/components/public/ClassCard";
import { getClasses } from "@/lib/api";

export default async function ClassesPage() {
  const classes = await getClasses().catch(() => []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900">All Classes</h1>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((musicClass) => (
            <ClassCard key={musicClass.id} musicClass={musicClass} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
