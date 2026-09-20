"use client";

export default function TeacherCard({ teacher, onSelect }) {
  const role = teacher.role || teacher._role || "Music Instructor";
  const experience = teacher.experience || teacher._experience || "Experienced";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-pink-100/70 bg-white shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      {/* Visual Placeholder / Photo Banner */}
      <div className="relative w-full aspect-[4/3] rounded-t-2xl overflow-hidden bg-gradient-to-b from-[#F29BB9] via-[#EA84A9] to-[#D8578B] flex items-center justify-center">
        {teacher.photoUrl ? (
          <img
            src={teacher.photoUrl}
            alt={teacher.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#F29BB9] via-[#EA84A9] to-[#D8578B]" />
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 text-left">
        <div>
          <h3 className="font-bold text-gray-900 text-[15px] sm:text-base leading-snug">
            {teacher.name}
          </h3>
          <p className="mt-1 text-xs font-medium text-[#E11D48]">
            {role}
          </p>
          <p className="mt-1 text-xs text-gray-500 font-normal">
            {experience}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelect?.(teacher)}
          className="mt-4 self-start inline-flex items-center justify-center px-4 py-1.5 rounded-md border border-[#E11D48] text-[#E11D48] text-xs font-semibold hover:bg-[#E11D48] hover:text-white transition-colors duration-200"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}
