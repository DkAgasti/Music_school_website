export default function TeacherCard({ teacher }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white text-center shadow-sm">
      {/* Photo */}
      <div className="relative mx-auto mt-6 h-28 w-28 overflow-hidden rounded-full bg-brand-50">
        {teacher.photoUrl ? (
          <img
            src={teacher.photoUrl}
            alt={teacher.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-4xl text-brand-300">
            🎵
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-serif text-base font-bold text-dark">
          {teacher.name}
        </h3>
        {teacher.bio && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
            {teacher.bio}
          </p>
        )}
        {teacher._role && (
          <span className="mt-2 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
            {teacher._role}
          </span>
        )}
        {teacher._experience && (
          <p className="mt-2 text-xs font-semibold text-brand-500">
            {teacher._experience}
          </p>
        )}
      </div>
    </div>
  );
}
