import { getStudentPayments } from "@/lib/api";

function rupees(paise) {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

export default async function StudentPaymentsPage() {
  const { totalPaid, pendingDues, nextDueDate, transactions } = await getStudentPayments();

  const nextDueLabel = new Date(nextDueDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="mt-1 text-sm text-gray-500">All your fee payments in one place</p>
        </div>

        <button
          type="button"
          className="self-start rounded-full bg-[#E11D48] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#D81B60] hover:shadow-md"
        >
          Pay Fees
        </button>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-pink-100/70 bg-white p-5">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{rupees(totalPaid)}</p>
        </div>
        <div className="rounded-xl border border-pink-100/70 bg-white p-5">
          <p className="text-sm text-gray-500">Pending Dues</p>
          <p className="mt-2 text-2xl font-bold text-green-600">{rupees(pendingDues)}</p>
        </div>
        <div className="rounded-xl border border-pink-100/70 bg-white p-5">
          <p className="text-sm text-gray-500">Next Due Date</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{nextDueLabel}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-6 rounded-2xl border border-pink-100/70 bg-white p-6 sm:p-7">
        <h2 className="font-serif text-xl font-bold text-gray-900">Transactions</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="bg-gray-50 py-3 pl-4 pr-4 font-semibold first:rounded-l-lg">Date</th>
                <th className="bg-gray-50 py-3 pr-4 font-semibold">Description</th>
                <th className="bg-gray-50 py-3 pr-4 font-semibold">Amount</th>
                <th className="bg-gray-50 py-3 pr-4 font-semibold">Status</th>
                <th className="bg-gray-50 py-3 pr-4 font-semibold text-right last:rounded-r-lg">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="py-3 pl-4 pr-4 text-gray-700">
                    {new Date(txn.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{txn.description}</td>
                  <td className="py-3 pr-4 font-semibold text-gray-900">{rupees(txn.amount)}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <button type="button" className="text-sm font-semibold text-[#E11D48] hover:text-[#D81B60]">
                      Download
                    </button>
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
