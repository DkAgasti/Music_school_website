import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/admissions", label: "Admissions" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/batches", label: "Batches" },
  { href: "/admin/fees", label: "Fees" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/progress", label: "Progress" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4">
      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
