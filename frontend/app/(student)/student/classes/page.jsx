import { getStudentClasses } from "@/lib/api";
import NoteIcon from "@/components/student/NoteIcon";

export default async function StudentClassesPage() {
  const classes = await getStudentClasses();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-gray-900">Enrolled Classes</h1>
      <p className="mt-1 text-sm text-gray-500">All classes you are currently enrolled in</p>

      <div className="mt-6 space-y-4">
        {classes.map((cls) => {
          const startedLabel = new Date(cls.startedDate).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={cls.id}
              className="flex flex-col gap-4 rounded-2xl border border-pink-100/70 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#E11D48]">
                  <NoteIcon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{cls.name}</p>
                  <p className="mt-0.5 text-sm text-gray-500">Teacher: {cls.teacher}</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {cls.schedule} &middot; Started: {startedLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pl-[3.25rem] sm:pl-0">
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {cls.status}
                </span>
                <button
                  type="button"
                  className="rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
