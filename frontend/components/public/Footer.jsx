import Link from "next/link";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/classes", label: "Classes" },
  { href: "/teachers", label: "Teachers" },
  { href: "/gallery", label: "Gallery" },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-400">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 text-white">
            <span className="text-2xl text-brand-400">&#9835;</span>
            <span className="text-lg font-bold">Harmony Music School</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            Learn &middot; Play &middot; Grow
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-brand-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
            Contact Us
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">&#9742;</span>
              +91 87655 43210
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">&#9993;</span>
              info@harmonymusic.in
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">&#9873;</span>
              123 Music Lane, Green Park
              <br />
              New Delhi &mdash; 110016
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
            Follow Us
          </h4>
          <div className="flex gap-3">
            {["Facebook", "Instagram", "LinkedIn"].map((name) => (
              <a
                key={name}
                href="#"
                aria-label={name}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs text-gray-400 transition-colors hover:bg-brand-500 hover:text-white"
              >
                {name.charAt(0)}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-gray-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Harmony Music School. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-brand-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brand-400">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
