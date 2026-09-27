// Covers everything under /student/* (the nested student/layout.jsx client
// component renders inside this). A private student portal, never meant to
// be indexed by search engines.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function StudentGroupLayout({ children }) {
  return children;
}
