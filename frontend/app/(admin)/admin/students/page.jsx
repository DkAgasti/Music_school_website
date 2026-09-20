"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const DEFAULT_STUDENTS = [
  { id: "s-1", name: "Aarav Sharma", studentId: "HMS-014", classes: "Guitar, Piano", joined: "Jan 2025", attendance: "92%", status: "Active", email: "aarav.s@example.com", phone: "+91 98765 43210", guardian: "Rajesh Sharma", address: "Kothrud, Pune" },
  { id: "s-2", name: "Diya Patel", studentId: "HMS-021", classes: "Piano", joined: "Feb 2025", attendance: "88%", status: "Active", email: "diya.p@example.com", phone: "+91 98123 45678", guardian: "Kiran Patel", address: "Aundh, Pune" },
  { id: "s-3", name: "Rohan Mehta", studentId: "HMS-008", classes: "Tabla", joined: "Dec 2024", attendance: "95%", status: "Active", email: "rohan.m@example.com", phone: "+91 98234 56789", guardian: "Suresh Mehta", address: "Baner, Pune" },
  { id: "s-4", name: "Ananya Singh", studentId: "HMS-030", classes: "Violin", joined: "Mar 2025", attendance: "90%", status: "Active", email: "ananya.s@example.com", phone: "+91 98345 67890", guardian: "Vikram Singh", address: "Viman Nagar, Pune" },
  { id: "s-5", name: "Ishita Rao", studentId: "HMS-033", classes: "Vocals", joined: "Mar 2025", attendance: "86%", status: "Active", email: "ishita.r@example.com", phone: "+91 98456 78901", guardian: "Prakash Rao", address: "Kalyani Nagar, Pune" },
  { id: "s-6", name: "Vivaan Joshi", studentId: "HMS-036", classes: "Drums", joined: "Apr 2025", attendance: "81%", status: "Active", email: "vivaan.j@example.com", phone: "+91 98567 89012", guardian: "Deepak Joshi", address: "Wakad, Pune" },
  { id: "s-7", name: "Meera Nair", studentId: "HMS-040", classes: "Piano", joined: "Apr 2025", attendance: "89%", status: "Active", email: "meera.n@example.com", phone: "+91 98678 90123", guardian: "Rajan Nair", address: "Model Colony, Pune" },
  { id: "s-8", name: "Kabir Khan", studentId: "HMS-041", classes: "Guitar", joined: "Apr 2025", attendance: "—", status: "Waitlisted", email: "kabir.k@example.com", phone: "+91 98789 01234", guardian: "Nasir Khan", address: "Camp, Pune" },
];

export default function StudentsPage() {
  const [students, setStudents] = useState(DEFAULT_STUDENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "", class: "Guitar", studentId: "" });
  const [editForm, setEditForm] = useState({ name: "", classes: "Guitar", status: "Active", phone: "", email: "" });

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await api.get("/students", { auth: true });
        if (res && Array.isArray(res) && res.length > 0) {
          const mapped = res.map((s, index) => ({
            id: s.id,
            name: s.name,
            studentId: s.studentCode || `HMS-0${14 + index}`,
            classes: s.class?.name || "Guitar",
            joined: new Date(s.createdAt || s.joinedDate || Date.now()).toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
            attendance: "90%",
            status: s.active ? "Active" : "Waitlisted",
            email: s.email || "—",
            phone: s.phone || "—",
            guardian: s.guardianName || "Parent",
            address: s.address || "Pune",
          }));
          setStudents(mapped);
        }
      } catch (err) {
        console.warn("Using template students:", err.message);
      }
    }
    loadStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.studentId.toLowerCase().includes(term) ||
      s.classes.toLowerCase().includes(term)
    );
  });

  function exportCSV() {
    const headers = ["Student", "ID", "Classes", "Joined", "Attendance", "Status", "Email", "Phone"];
    const rows = filteredStudents.map((r) => [r.name, r.studentId, r.classes, r.joined, r.attendance, r.status, r.email, r.phone]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_directory.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Add new student (prepends to top)
  function handleAddStudent(e) {
    e.preventDefault();
    const newEntry = {
      id: `s-${Date.now()}`,
      name: addForm.name,
      studentId: addForm.studentId || `HMS-0${Math.floor(Math.random() * 80 + 10)}`,
      classes: addForm.class,
      joined: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
      attendance: "100%",
      status: "Active",
      email: addForm.email || "—",
      phone: addForm.phone || "—",
      guardian: "Guardian",
      address: "Pune",
    };
    setStudents([newEntry, ...students]);
    setShowAddModal(false);
    setAddForm({ name: "", email: "", phone: "", class: "Guitar", studentId: "" });
  }

  // Open Edit
  function handleOpenEdit(student) {
    setEditingStudent(student);
    setEditForm({
      name: student.name,
      classes: student.classes,
      status: student.status,
      phone: student.phone || "",
      email: student.email || "",
    });
  }

  // Save Edit
  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingStudent) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              name: editForm.name,
              classes: editForm.classes,
              status: editForm.status,
              phone: editForm.phone,
              email: editForm.email,
            }
          : s
      )
    );
    setEditingStudent(null);
  }

  // Delete Student
  function handleDeleteStudent(id, name) {
    if (!confirm(`Are you sure you want to delete student "${name}"?`)) return;
    setStudents((prev) => prev.filter((s) => s.id !== id));
    if (!id.startsWith("s-")) {
      api.delete(`/students/${id}`, { auth: true }).catch(() => {});
    }
  }

  // Toggle Active / Waitlisted
  function handleToggleStatus(id) {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const next = s.status === "Active" ? "Waitlisted" : "Active";
          return { ...s, status: next };
        }
        return s;
      })
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Students
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            All enrolled students
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-[#BE123C] transition-colors cursor-pointer self-start sm:self-auto"
        >
          Add Student
        </button>
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
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gray-400">
                    No students found matching &quot;{searchTerm}&quot;.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FFF7FB]/80 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-800">
                      {row.name}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{row.studentId}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.classes}</td>
                    <td className="px-4 py-3.5 text-gray-500">{row.joined}</td>
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      {row.attendance}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleStatus(row.id)}
                        title="Click to toggle status"
                        className={`inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-medium cursor-pointer transition-transform hover:scale-105 ${
                          row.status === "Active"
                            ? "bg-[#E8F8EE] text-[#16A34A]"
                            : "bg-[#FFEDD5] text-[#C2410C]"
                        }`}
                      >
                        {row.status}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* 1. View Icon */}
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

                        {/* 2. Edit Icon */}
                        <button
                          onClick={() => handleOpenEdit(row)}
                          title="Edit Student"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {/* 3. Delete Icon */}
                        <button
                          onClick={() => handleDeleteStudent(row.id, row.name)}
                          title="Delete Student"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FFE4E6] transition-colors cursor-pointer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
      </div>

      {/* View Student Profile Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F9EBF2] mb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-gray-900">
                  {viewingStudent.name}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{viewingStudent.studentId}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                viewingStudent.status === "Active" ? "bg-[#E8F8EE] text-[#16A34A]" : "bg-[#FFEDD5] text-[#C2410C]"
              }`}>
                {viewingStudent.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs py-2">
              <div>
                <span className="text-gray-400 block mb-0.5">Enrolled Classes</span>
                <span className="font-semibold text-gray-800 text-sm">{viewingStudent.classes}</span>
              </div>
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

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Edit Student Details
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Enrolled Classes
                </label>
                <input
                  type="text"
                  value={editForm.classes}
                  onChange={(e) => setEditForm({ ...editForm, classes: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Waitlisted">Waitlisted</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F3E2EC]">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Add New Student
            </h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={addForm.studentId}
                  onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value })}
                  placeholder="e.g. HMS-042 (optional)"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Class Enrolled
                </label>
                <select
                  value={addForm.class}
                  onChange={(e) => setAddForm({ ...addForm, class: e.target.value })}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
                >
                  <option value="Guitar">Guitar</option>
                  <option value="Piano">Piano</option>
                  <option value="Tabla">Tabla</option>
                  <option value="Violin">Violin</option>
                  <option value="Vocals">Vocals</option>
                  <option value="Drums">Drums</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F3E2EC]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C] cursor-pointer"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
