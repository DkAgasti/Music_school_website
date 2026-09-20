import { getStudentProgress } from "@/lib/api";

export default async function StudentProgressPage() {
  const { classes, recentNotes } = await getStudentProgress();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-gray-900">Progress Tracker</h1>
      <p className="mt-1 text-sm text-gray-500">Track your improvement across classes</p>

      {/* Progress bars */}
      <div className="mt-6 space-y-4">
        {classes.map((cls) => (
          <div key={cls.id} className="rounded-2xl border border-pink-100/70 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{cls.name}</p>
                <p className="mt-0.5 text-sm text-gray-500">{cls.level}</p>
              </div>
              <p className="text-lg font-bold text-[#E11D48]">{cls.percent}%</p>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#E11D48]"
                style={{ width: `${cls.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent notes */}
      <div className="mt-6 rounded-2xl border border-pink-100/70 bg-white p-6 sm:p-7">
        <h2 className="font-serif text-xl font-bold text-gray-900">Recent Notes from Teachers</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="bg-gray-50 py-3 pl-4 pr-4 font-semibold first:rounded-l-lg">Class</th>
                <th className="bg-gray-50 py-3 pr-4 font-semibold">Note</th>
                <th className="bg-gray-50 py-3 pr-4 font-semibold text-right last:rounded-r-lg">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentNotes.map((note) => (
                <tr key={note.id}>
                  <td className="py-3 pl-4 pr-4 font-semibold text-gray-900">{note.class}</td>
                  <td className="py-3 pr-4 text-gray-700">{note.note}</td>
                  <td className="py-3 pr-4 text-right text-gray-400">
                    {new Date(note.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
