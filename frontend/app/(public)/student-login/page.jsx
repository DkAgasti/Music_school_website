import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import StudentLoginClient from "./StudentLoginClient";

export const metadata = {
  title: "Student Login - Synchrocity Music School",
  // A login form has nothing worth indexing, and shouldn't rank over the
  // real marketing pages.
  robots: { index: false, follow: false },
};

export default function StudentLoginPage() {
  return (
    <>
      <Navbar />
      <StudentLoginClient />
      <Footer />
    </>
  );
}
