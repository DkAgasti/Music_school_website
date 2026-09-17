import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { getClassBySlug } from "@/lib/api";

export default async function ClassDetailPage({ params }) {
  const musicClass = await getClassBySlug(params.slug).catch(() => null);

  if (!musicClass) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-16">
          <p className="text-gray-600">Class not found.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900">{musicClass.title}</h1>
        <p className="mt-4 text-gray-600">{musicClass.description}</p>
        {musicClass.syllabus && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">Syllabus</h2>
            <p className="mt-2 text-gray-600">{musicClass.syllabus}</p>
          </div>
        )}
        <p className="mt-6 text-xl font-semibold text-indigo-600">₹{musicClass.fee}</p>
        {musicClass.teacher && (
          <p className="mt-2 text-sm text-gray-500">Taught by {musicClass.teacher.name}</p>
        )}
      </main>
      <Footer />
    </>
  );
}
