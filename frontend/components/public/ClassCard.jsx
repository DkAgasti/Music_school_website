import Link from "next/link";

export default function ClassCard({ musicClass }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-brand-50">
        {musicClass.imageUrl ? (
          <img
            src={musicClass.imageUrl}
            alt={musicClass.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-brand-300">
            {musicClass.name === "Guitar" && "🎸"}
            {musicClass.name === "Piano" && "🎹"}
            {musicClass.name === "Vocals" && "🎤"}
            {musicClass.name === "Tabla" && "🥁"}
            {!["Guitar", "Piano", "Vocals", "Tabla"].includes(musicClass.name) &&
              "🎵"}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-serif text-lg font-bold text-dark">
          {musicClass.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500">
          {musicClass.description}
        </p>
        <Link
          href={`/classes/${musicClass.slug}`}
          className="mt-4 inline-block text-sm font-semibold text-brand-500 transition-colors hover:text-brand-600"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
