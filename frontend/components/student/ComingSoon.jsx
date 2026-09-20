export default function ComingSoon({ title, description }) {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-gray-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}

      <div className="mt-6 flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-pink-200 bg-white/60 text-sm text-gray-500">
        This section is coming soon.
      </div>
    </div>
  );
}
