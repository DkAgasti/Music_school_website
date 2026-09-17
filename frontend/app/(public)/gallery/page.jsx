import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { getGalleryImages } from "@/lib/api";

export default async function GalleryPage() {
  const images = await getGalleryImages().catch(() => []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img src={img.url} alt={img.caption ?? ""} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
