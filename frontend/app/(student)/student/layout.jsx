import StudentShell from "@/components/student/StudentShell";
import StudentGuard from "@/components/student/StudentGuard";

export default function StudentLayout({ children }) {
  return (
    <StudentGuard>
      <StudentShell>{children}</StudentShell>
    </StudentGuard>
  );
}
