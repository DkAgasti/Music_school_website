import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteName = "Synchrocity Music School";
const siteDescription =
  "Join Synchrocity Music School for expert-led classes in guitar, piano, vocals, violin, drums and tabla. Flexible batches, experienced faculty, and a free trial class.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: `${siteName} - Learn Guitar, Piano, Vocals & More`,
  description: siteDescription,
  keywords: [
    "music school",
    "guitar classes",
    "piano classes",
    "vocal training",
    "violin classes",
    "drum classes",
    "tabla classes",
    "music lessons near me",
  ],
  // Default for public pages; the (admin) and (student) route groups
  // override this to noindex, since those are private portals, not
  // marketing pages.
  robots: { index: true, follow: true },
  icons: {
    icon: "https://res.cloudinary.com/vpetrpeu/image/upload/v1790358770/Logo_2.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName,
    title: `${siteName} - Learn Guitar, Piano, Vocals & More`,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Learn Guitar, Piano, Vocals & More`,
    description: siteDescription,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}
