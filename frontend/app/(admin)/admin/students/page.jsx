"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGetStudents, apiUpdateStudent } from "@/Api/admin/studentApi";
import StudentAvatar from "@/components/admin/StudentAvatar";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 20;

function mapStudent(s) {
  const enrollments = s.enrollments || [];
  return {
    id: s.id,
    name: s.name,
    photoUrl: s.photoUrl || null,
    studentId: s.id ? `HMS-${String(s.id).slice(-5).toUpperCase()}` : "—",
    enrollments,
    classes: enrollments.map((e) => e.class?.name).filter(Boolean).join(", ") || "—",
    joined: s.joinedDate
      ? new Date(s.joinedDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
      : "—",
    attendance: s.attendancePercentage || "—",
    active: !!s.active,
    status: s.active ? "Active" : "Inactive",
    email: s.email || "—",
    phone: s.phone || "—",
    guardian: s.guardianName || "—",
    address: s.address || "—",
    dob: s.dob ? String(s.dob).slice(0, 10) : "",
  };
}

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewingStudent, setViewingStudent] = useState(null);

  const loadStudents = useCallback(async (pageToLoad, search) => {
    setLoading(true);
    const res = await apiGetStudents({ page: pageToLoad, limit: PAGE_SIZE, search: search || undefined });
    if (res && Array.isArray(res.items)) {
      setStudents(res.items.map(mapStudent));
      setTotalPages(res.totalPages);
    }
    setLoading(false);
  }, []);

  // Reset to page 1 whenever the search term changes, debounced so we're not
  // firing a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadStudents(1, searchTerm);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    loadStudents(page, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function exportCSV() {
    const headers = ["Student", "ID", "Classes", "Joined", "Attendance", "Status", "Email", "Phone"];
    const rows = students.map((r) => [r.name, r.studentId, r.classes, r.joined, r.attendance, r.status, r.email, r.phone]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_directory.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Toggle Active / Inactive
  async function handleToggleStatus(id) {
    const target = students.find((s) => s.id === id);
    if (!target) return;
    const updated = await apiUpdateStudent(id, { active: !target.active });
    if (updated) {
      const mapped = mapStudent(updated);
      setStudents((prev) => prev.map((s) => (s.id === id ? mapped : s)));
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          Students
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          All enrolled students
        </p>
      </div>

      {/* Search Input Bar (Pill) */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search students..."
          className="w-full rounded-full border border-[#F3E2EC] bg-white pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E11D48] shadow-xs"
        />
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-[#F3E2EC] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg font-bold text-gray-900">
            Student Directory
          </h2>
          <button
            onClick={exportCSV}
            className="text-xs font-semibold text-[#E11D48] hover:underline cursor-pointer"
          >
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="rounded-xl bg-[#FDEEF5] text-xs font-semibold text-gray-600">
                <th className="rounded-l-xl px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="px-4 py-3 font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Classes</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Joined</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Attendance</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                <th className="rounded-r-xl px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9EBF2] text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gray-400">
                    Loading students...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gray-400">
                    {searchTerm ? `No students found matching "${searchTerm}".` : "No students yet."}
                  </td>
                </tr>
              ) : (
                students.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-800">
                      <div className="flex items-center gap-2.5">
                        <StudentAvatar name={row.name} photoUrl={row.photoUrl} />
                        {row.name}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{row.studentId}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.classes}</td>
                    <td className="px-4 py-3.5 text-gray-500">{row.joined}</td>
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      {row.attendance}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={row.active}
                          onClick={() => handleToggleStatus(row.id)}
                          title={
                            row.active
                              ? "Active — click to deactivate (blocks their student login)"
                              : "Inactive — click to reactivate"
                          }
                          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                            row.active ? "bg-[#16A34A]" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                              row.active ? "translate-x-[18px]" : "translate-x-1"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-xs font-medium ${
                            row.active ? "text-[#16A34A]" : "text-[#C2410C]"
                          }`}
                        >
                          {row.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* View Icon */}
                        <button
                          onClick={() => setViewingStudent(row)}
                          title="View Profile"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* View Student Profile Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F9EBF2] mb-4">
              <div className="flex items-center gap-3">
                <StudentAvatar
                  name={viewingStudent.name}
                  photoUrl={viewingStudent.photoUrl}
                  size="h-11 w-11 text-base"
                />
                <div>
                  <h3 className="font-serif text-xl font-bold text-gray-900">
                    {viewingStudent.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{viewingStudent.studentId}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                viewingStudent.status === "Active" ? "bg-[#E8F8EE] text-[#16A34A]" : "bg-[#FFEDD5] text-[#C2410C]"
              }`}>
                {viewingStudent.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs py-2">
              <div>
                <span className="text-gray-400 block mb-0.5">Attendance Rate</span>
                <span className="font-bold text-gray-900 text-sm">{viewingStudent.attendance}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Joined Date</span>
                <span className="font-medium text-gray-700">{viewingStudent.joined}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Phone</span>
                <span className="font-medium text-gray-700">{viewingStudent.phone}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Email</span>
                <span className="font-medium text-gray-700">{viewingStudent.email}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Guardian Name</span>
                <span className="font-medium text-gray-700">{viewingStudent.guardian}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block mb-0.5">Address</span>
                <span className="font-medium text-gray-700">{viewingStudent.address}</span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#F9EBF2]">
              <span className="text-xs text-gray-400 block mb-1.5">Enrolled Classes</span>
              {viewingStudent.enrollments.length === 0 ? (
                <p className="text-xs text-gray-400">Not enrolled in any class yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {viewingStudent.enrollments.map((en) => (
                    <div
                      key={en.id}
                      className="flex items-center justify-between rounded-lg bg-[#FFF7FB] border border-[#F9EBF2] px-3 py-1.5 text-xs"
                    >
                      <span className="font-semibold text-gray-800">{en.class?.name}</span>
                      <span className="text-gray-500">{en.batch?.name}</span>
                      <span className={en.active ? "text-emerald-600" : "text-gray-400"}>
                        {en.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-[#F9EBF2]">
              <button
                onClick={() => setViewingStudent(null)}
                className="rounded-xl bg-[#E11D48] px-5 py-2 text-xs font-medium text-white hover:bg-[#BE123C] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
