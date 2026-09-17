export default function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      <input
        className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none ${className}`}
        {...props}
      />
    </label>
  );
}
