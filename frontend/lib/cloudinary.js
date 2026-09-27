// Cloudinary lets us request a resized, auto-format/auto-quality version of an
// already-uploaded image by inserting a transformation segment into the URL,
// instead of shipping the full-resolution original to every device.
export function cloudinaryThumb(url, width = 480) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
