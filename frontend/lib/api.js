import { getToken } from "./auth";
import * as mock from "./mockData";

// ─── Low-level fetch helper (used by admin / auth calls) ────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Request failed");
  }

  return json.data;
}

// ─── Public API (currently returns mock data) ───────────────────────
// Each function will later call the real backend via request().

export async function getClasses() {
  // TODO: replace with → request("/classes")
  return mock.classes;
}

export async function getClassBySlug(slug) {
  // TODO: replace with → request(`/classes/${slug}`)
  return mock.classes.find((c) => c.slug === slug) ?? null;
}

export async function getTeachers() {
  // TODO: replace with → request("/teachers")
  return mock.teachers;
}

export async function getTestimonials() {
  // TODO: replace with → request("/testimonials")
  return mock.testimonials;
}

export async function getGalleryImages() {
  // TODO: replace with → request("/gallery")
  return mock.galleryImages;
}

export async function getProducts() {
  // TODO: replace with → request("/shop/products")
  return mock.products;
}

export async function getProductBySlug(slug) {
  // TODO: replace with → request(`/shop/products/${slug}`)
  return mock.products.find((p) => p.slug === slug) ?? null;
}

export async function submitEnquiry(data) {
  // TODO: replace with → request("/enquiries", { method: "POST", body: data })
  console.log("[mock] submitEnquiry", data);
  return { id: "enq_mock", ...data, handled: false };
}

export async function submitAdmission(data) {
  // TODO: replace with → request("/admissions", { method: "POST", body: data })
  console.log("[mock] submitAdmission", data);
  return { id: "adm_mock", ...data, status: "PENDING" };
}

// ─── Admin / auth helper (still hits real backend) ──────────────────

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  patch: (path, body, opts) =>
    request(path, { ...opts, method: "PATCH", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
