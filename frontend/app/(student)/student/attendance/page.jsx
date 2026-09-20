import { getStudentAttendance } from "@/lib/api";

function StatCard({ label, value, valueClassName = "text-gray-900" }) {
  return (
    <div className="rounded-xl border border-pink-100/70 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueClassName}`}>{value}</p>
    </div>
  );
}

export default async function StudentAttendancePage() {
  const { overall, sessionsPresent, sessionsAbsent, recentSessions } = await getStudentAttendance();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-gray-900">Attendance</h1>
      <p className="mt-1 text-sm text-gray-500">Your attendance record for this term</p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Overall Attendance" value={`${overall}%`} />
        <StatCard label="Sessions Present" value={sessionsPresent} valueClassName="text-green-600" />
        <StatCard label="Sessions Absent" value={sessionsAbsent} valueClassName="text-red-600" />
      </div>

      {/* Recent sessions */}
      <div className="mt-6 rounded-2xl border border-pink-100/70 bg-white p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-gray-900">Recent Sessions</h2>
          <button type="button" className="text-sm font-semibold text-[#E11D48] hover:text-[#D81B60]">
            View All
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-3 pr-4 font-semibold">Date</th>
                <th className="py-3 pr-4 font-semibold">Class</th>
                <th className="py-3 pr-4 font-semibold">Time</th>
                <th className="py-3 pl-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentSessions.map((session) => {
                const dateLabel = new Date(session.date).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const isPresent = session.status === "Present";

                return (
                  <tr key={session.id}>
                    <td className="py-3 pr-4 text-gray-700">{dateLabel}</td>
                    <td className="py-3 pr-4 text-gray-700">{session.class}</td>
                    <td className="py-3 pr-4 text-gray-700">{session.time}</td>
                    <td className="py-3 pl-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isPresent ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
