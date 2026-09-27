// Covers every route in this group — /login, /forgot-password, and
// everything under /admin/* (the nested admin/layout.jsx client component
// renders inside this). None of it should ever be indexed by search engines.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminGroupLayout({ children }) {
  return children;
}
