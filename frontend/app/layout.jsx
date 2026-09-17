import "./globals.css";

export const metadata = {
  title: "Music School",
  description: "Learn music with us",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
