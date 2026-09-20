import { getStudentAdmissions } from "@/lib/api";

const STATUS_STYLES = {
  Approved: "bg-green-50 text-green-700",
  Completed: "bg-gray-100 text-gray-600",
  Pending: "bg-yellow-50 text-yellow-700",
  Rejected: "bg-red-50 text-red-700",
};

export default async function StudentAdmissionsPage() {
  const admissions = await getStudentAdmissions();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-gray-900">Past Admissions</h1>
      <p className="mt-1 text-sm text-gray-500">Your admission applications and their status</p>

      <div className="mt-6 rounded-2xl border border-pink-100/70 bg-white p-6 sm:p-7">
        <h2 className="font-serif text-xl font-bold text-gray-900">Applications</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="bg-gray-50 py-3 pl-4 pr-4 font-semibold first:rounded-l-lg">Admission ID</th>
                <th className="bg-gray-50 py-3 pr-4 font-semibold">Class</th>
                <th className="bg-gray-50 py-3 pr-4 font-semibold">Applied On</th>
                <th className="bg-gray-50 py-3 pr-4 font-semibold">Batch</th>
                <th className="bg-gray-50 py-3 pr-4 font-semibold last:rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admissions.map((admission) => (
                <tr key={admission.id}>
                  <td className="py-3 pl-4 pr-4 font-semibold text-gray-900">{admission.id}</td>
                  <td className="py-3 pr-4 text-gray-700">{admission.class}</td>
                  <td className="py-3 pr-4 text-gray-700">
                    {new Date(admission.appliedOn).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{admission.batch}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        STATUS_STYLES[admission.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {admission.status}
                    </span>
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
