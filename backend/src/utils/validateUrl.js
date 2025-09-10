export default function isValidUrl(str) {
  try {
    const u = new URL(str);
    // allow http or https
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (e) {
    return false;
  }
}