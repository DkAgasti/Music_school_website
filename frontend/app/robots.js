const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin and student portals are private, not marketing pages — never
      // let a search engine crawl or index them.
      disallow: ["/admin", "/login", "/forgot-password", "/student", "/student-login"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
