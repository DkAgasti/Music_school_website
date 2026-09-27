export default function StudentAvatar({ name, photoUrl, size = "h-8 w-8 text-xs" }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${size} shrink-0 rounded-full object-cover border border-[#F9EBF2]`}
      />
    );
  }
  return (
    <div
      className={`${size} shrink-0 rounded-full bg-[#FDEEF5] text-[#E11D48] flex items-center justify-center font-bold border border-[#F9EBF2]`}
    >
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}
