"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiGetSiteSettings, apiUpdateSiteSetting } from "@/Api/admin/siteSettingsApi";
import { apiUploadImage } from "@/Api/admin/uploadApi";
import {
  apiGetGalleryImagesPaged,
  apiCreateGalleryImage,
  apiDeleteGalleryImage,
} from "@/Api/admin/galleryApi";

const GALLERY_CATEGORIES = ["Recitals", "Classes", "Events", "Campus"];
const GALLERY_PAGE_SIZE = 24;

const EMPTY_FORM = {
  logoUrl: "",
  businessName: "",
  tagline: "",
  phone: "",
  email: "",
  address: "",
  googleMapEmbedUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
};

export default function BusinessSettingsPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryCategory, setGalleryCategory] = useState("Recitals");
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState({ done: 0, total: 0 });
  const [galleryPage, setGalleryPage] = useState(1);
  const [galleryTotalPages, setGalleryTotalPages] = useState(1);
  const [galleryTotal, setGalleryTotal] = useState(0);

  useEffect(() => {
    loadSettings();
    loadGalleryImages(1);
  }, []);

  async function loadGalleryImages(page = 1) {
    setGalleryLoading(true);
    const res = await apiGetGalleryImagesPaged({ page, limit: GALLERY_PAGE_SIZE });
    if (res) {
      setGalleryImages(res.items);
      setGalleryPage(res.page);
      setGalleryTotalPages(res.totalPages);
      setGalleryTotal(res.total);
    }
    setGalleryLoading(false);
  }

  async function handleGalleryFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingGalleryImage(true);
    setGalleryUploadProgress({ done: 0, total: files.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const url = await apiUploadImage(files[i], "gallery");
      if (url) {
        const created = await apiCreateGalleryImage({ url, category: galleryCategory, silent: true });
        if (created) successCount += 1;
        else failCount += 1;
      } else {
        failCount += 1;
      }
      setGalleryUploadProgress({ done: i + 1, total: files.length });
    }

    if (successCount > 0) toast.success(`${successCount} photo${successCount > 1 ? "s" : ""} uploaded`);
    if (failCount > 0) toast.error(`${failCount} photo${failCount > 1 ? "s" : ""} failed to upload`);

    setUploadingGalleryImage(false);
    e.target.value = "";
    await loadGalleryImages(1);
  }

  async function handleDeleteGalleryImage(id) {
    if (!confirm("Remove this photo from the gallery?")) return;
    const ok = await apiDeleteGalleryImage(id);
    if (!ok) return;

    const isLastOnPage = galleryImages.length === 1 && galleryPage > 1;
    await loadGalleryImages(isLastOnPage ? galleryPage - 1 : galleryPage);
  }

  async function loadSettings() {
    setLoading(true);
    const settings = await apiGetSiteSettings();
    if (settings) {
      setForm({
        logoUrl: settings.logoUrl || "",
        businessName: settings.businessName || "",
        tagline: settings.tagline || "",
        phone: settings.phone || "",
        email: settings.email || "",
        address: settings.address || "",
        googleMapEmbedUrl: settings.googleMapEmbedUrl || "",
        facebookUrl: settings.facebookUrl || "",
        instagramUrl: settings.instagramUrl || "",
        youtubeUrl: settings.youtubeUrl || "",
      });
    }
    setLoading(false);
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const url = await apiUploadImage(file, "site");
    setUploadingLogo(false);
    if (url) update("logoUrl", url);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    const entries = [
      ["logoUrl", form.logoUrl],
      ["businessName", form.businessName],
      ["tagline", form.tagline],
      ["phone", form.phone],
      ["email", form.email],
      ["address", form.address],
      ["googleMapEmbedUrl", form.googleMapEmbedUrl],
      ["facebookUrl", form.facebookUrl],
      ["instagramUrl", form.instagramUrl],
      ["youtubeUrl", form.youtubeUrl],
    ];

    const results = await Promise.all(
      entries.map(([key, value]) => apiUpdateSiteSetting(key, value))
    );

    setSaving(false);
    if (results.every(Boolean)) {
      toast.success("Business settings saved");
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          Business Settings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Logo, address, Google Map, and social links shown across the public site
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#F3E2EC] bg-white p-6 text-center text-xs text-gray-400 shadow-xs">
          Loading settings...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Logo + Brand */}
          <div className="rounded-2xl border border-[#F3E2EC] bg-white p-6 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-5">Logo &amp; Brand</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Logo</label>
                <div className="flex items-center gap-3">
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt="Logo preview"
                      className="h-14 w-14 rounded-xl object-cover border border-[#F3E2EC]"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-gray-100 shrink-0" />
                  )}
                  <label className="flex-1 cursor-pointer rounded-xl border border-dashed border-[#F3E2EC] px-3.5 py-2 text-xs text-gray-500 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors text-center">
                    {uploadingLogo ? "Uploading…" : form.logoUrl ? "Change logo" : "Upload logo from your computer"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => update("businessName", e.target.value)}
                  placeholder="e.g. Synchrocity Music School"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => update("tagline", e.target.value)}
                  placeholder="e.g. Learn · Play · Grow"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-2xl border border-[#F3E2EC] bg-white p-6 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-5">Contact Details</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="e.g. info@harmonymusic.in"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="e.g. 123 Music Lane, Green Park, New Delhi – 110016"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48] resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Google Map Embed URL
                </label>
                <input
                  type="text"
                  value={form.googleMapEmbedUrl}
                  onChange={(e) => update("googleMapEmbedUrl", e.target.value)}
                  placeholder="Paste the src URL from Google Maps → Share → Embed a map"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  On Google Maps, search your location → Share → Embed a map → copy the src=&quot;...&quot; link from the code and paste it here. Shows a live map on the Contact page.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={form.facebookUrl}
                  onChange={(e) => update("facebookUrl", e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={form.instagramUrl}
                  onChange={(e) => update("instagramUrl", e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">YouTube URL</label>
                <input
                  type="text"
                  value={form.youtubeUrl}
                  onChange={(e) => update("youtubeUrl", e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#E11D48] px-6 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-[#BE123C] transition-colors cursor-pointer disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {/* Gallery Photos — saved instantly per photo, not part of the form above */}
      <div className="rounded-2xl border border-[#F3E2EC] bg-white p-6 shadow-xs">
        <h2 className="font-serif text-lg font-bold text-gray-900 mb-1">Gallery Photos</h2>
        <p className="text-xs text-gray-500 mb-5">
          Shown on the public Gallery page and homepage
          {galleryTotal > 0 && ` · ${galleryTotal} total`}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <select
            value={galleryCategory}
            onChange={(e) => setGalleryCategory(e.target.value)}
            className="rounded-xl border border-[#F3E2EC] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] bg-white"
          >
            {GALLERY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center justify-center cursor-pointer rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-[#BE123C] transition-colors disabled:opacity-60">
            {uploadingGalleryImage
              ? `Uploading ${galleryUploadProgress.done}/${galleryUploadProgress.total}…`
              : "+ Upload Photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryFileChange}
              disabled={uploadingGalleryImage}
              className="hidden"
            />
          </label>
        </div>

        {galleryLoading ? (
          <p className="py-8 text-center text-xs text-gray-400">Loading gallery...</p>
        ) : galleryImages.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400">
            No photos yet. Upload one above.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-[#F3E2EC] bg-gray-50"
              >
                <img src={img.url} alt={img.caption || ""} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-start justify-end bg-black/0 p-1.5 opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleDeleteGalleryImage(img.id)}
                    title="Remove"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-[#E11D48] cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {img.category && (
                  <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
                    {img.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {!galleryLoading && galleryTotalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => loadGalleryImages(galleryPage - 1)}
              disabled={galleryPage <= 1}
              className="rounded-lg border border-[#F3E2EC] px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-[#E11D48] hover:text-[#E11D48] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#F3E2EC] disabled:hover:text-gray-600"
            >
              Previous
            </button>

            <span className="text-xs text-gray-500">
              Page {galleryPage} of {galleryTotalPages}
            </span>

            <button
              type="button"
              onClick={() => loadGalleryImages(galleryPage + 1)}
              disabled={galleryPage >= galleryTotalPages}
              className="rounded-lg border border-[#F3E2EC] px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-[#E11D48] hover:text-[#E11D48] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#F3E2EC] disabled:hover:text-gray-600"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
