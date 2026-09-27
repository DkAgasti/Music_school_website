import { cache } from "react";
import { apiGetClassBySlug } from "@/Api/public/classApi";
import ClassDetailClient from "./ClassDetailClient";

// Metadata still needs a server-side fetch — it must be in the initial HTML
// for crawlers/link previews, which is the one thing a client component
// can't provide. The page body re-fetches client-side (see ClassDetailClient).
const getClassBySlug = cache(apiGetClassBySlug);

export async function generateMetadata({ params }) {
  const musicClass = await getClassBySlug(params.slug);
  if (!musicClass) {
    return { title: "Class Not Found - Synchrocity Music School" };
  }

  const title = `${musicClass.name} Classes - Synchrocity Music School`;
  const description =
    musicClass.description ||
    `Learn ${musicClass.name} at Synchrocity Music School — expert instructors, flexible batches, and a free trial class.`;

  return {
    title,
    description,
    openGraph: musicClass.imageUrl
      ? { title, description, images: [{ url: musicClass.imageUrl }] }
      : { title, description },
  };
}

export default function ClassDetailPage({ params }) {
  return <ClassDetailClient slug={params.slug} />;
}
