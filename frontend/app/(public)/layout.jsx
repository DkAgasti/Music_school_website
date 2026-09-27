"use client";

import { useEffect, useState } from "react";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import { AdmissionProvider } from "@/context/AdmissionContext";
import AdmissionModal from "@/components/public/AdmissionModal";
import { apiGetSiteSettings } from "@/Api/public/siteSettingsApi";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function PublicLayout({ children }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    apiGetSiteSettings().then(setSettings);
  }, []);

  // Structured data so search engines understand this as a real business —
  // sourced from the same dynamic Business Settings every other public page
  // already uses, never hardcoded. JSON-LD is valid anywhere in the body,
  // not just <head>, so it's fine to render from a nested layout like this.
  const businessJsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicSchool",
    name: settings?.businessName || "Synchrocity Music School",
    description: settings?.tagline || undefined,
    url: siteUrl,
    telephone: settings?.phone || undefined,
    email: settings?.email || undefined,
    address: settings?.address || undefined,
    sameAs: [settings?.facebookUrl, settings?.instagramUrl, settings?.youtubeUrl].filter(Boolean),
  };

  return (
    <AdmissionProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
      />
      {children}
      <AdmissionModal />
      <WhatsAppButton phone={settings?.phone} />
    </AdmissionProvider>
  );
}
