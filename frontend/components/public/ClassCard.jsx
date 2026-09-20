import Link from "next/link";

export default function ClassCard({ musicClass }) {
  const duration = musicClass.duration || "6 Months";
  const feeRange = musicClass.feeRange || (musicClass.feePlans?.[0] ? `₹${(musicClass.feePlans[0].amount / 100).toLocaleString()}/month` : "₹2,000 – ₹3,000/month");
  const tagline = musicClass.tagline || musicClass.description;

  return (
    <div className="group flex flex-col justify-between rounded-2xl bg-white p-5 border border-pink-100/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div>
        {/* Rounded inset image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gradient-to-tr from-[#D63E82] via-[#E66DA4] to-[#F298BE]">
          {musicClass.imageUrl ? (
            <img
              src={musicClass.imageUrl}
              alt={musicClass.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-tr from-[#D63E82] via-[#E66DA4] to-[#F298BE]" />
          )}
        </div>

        {/* Title */}
        <h3 className="mt-4 font-sans text-xl font-bold text-gray-900">
          {musicClass.name}
        </h3>

        {/* Subtitle / Tagline */}
        <p className="mt-1 line-clamp-1 text-xs md:text-sm text-gray-500">
          {tagline}
        </p>

        {/* Meta rows */}
        <div className="mt-3.5 space-y-1">
          <div className="text-xs md:text-sm">
            <span className="font-bold text-[#D8006E]">Duration:</span>
            <span className="font-bold text-gray-900">{duration}</span>
          </div>
          <div className="text-xs md:text-sm font-bold text-gray-900">
            Fee:{feeRange}
          </div>
        </div>
      </div>

      {/* View Details Link */}
      <div className="mt-5">
        <Link
          href={`/classes/${musicClass.slug}`}
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-[#D8006E] transition-colors hover:text-[#B7005D]"
        >
          View Details <span className="text-base leading-none">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
