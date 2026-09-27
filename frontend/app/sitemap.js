import { apiGetClasses } from "@/Api/public/classApi";
import { apiGetProducts } from "@/Api/public/shopApi";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const STATIC_ROUTES = ["", "/about", "/classes", "/teachers", "/gallery", "/shop", "/contact", "/testimonials"];

export default async function sitemap() {
  const [classes, products] = await Promise.all([
    apiGetClasses().catch(() => null),
    apiGetProducts({ active: true }).catch(() => null),
  ]);

  const staticEntries = STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const classEntries = (classes || []).map((c) => ({
    url: `${siteUrl}/classes/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
  }));

  const productEntries = (Array.isArray(products) ? products : []).map((p) => ({
    url: `${siteUrl}/shop/${p.slug}/checkout`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
  }));

  return [...staticEntries, ...classEntries, ...productEntries];
}
