export default function TestimonialCard({ testimonial }) {
  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Quote icon */}
      <span className="absolute -top-4 left-6 text-4xl text-brand-300 select-none">
        &ldquo;
      </span>

      <p className="mt-2 text-sm leading-relaxed text-gray-600 italic">
        {testimonial.message}
      </p>

      <div className="mt-4 flex items-center gap-3">
        {/* Avatar placeholder */}
        <div className="h-9 w-9 overflow-hidden rounded-full bg-brand-100">
          {testimonial.imageUrl ? (
            <img
              src={testimonial.imageUrl}
              alt={testimonial.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-xs font-bold text-brand-500">
              {testimonial.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-dark">{testimonial.name}</p>
          {testimonial._role && (
            <p className="text-xs text-gray-400">{testimonial._role}</p>
          )}
        </div>
      </div>

      {/* Stars */}
      <div className="mt-3 flex gap-0.5 text-brand-500">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
  );
}
