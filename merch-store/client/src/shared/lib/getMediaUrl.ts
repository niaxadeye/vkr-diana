export function getMediaUrl(url?: string | null) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
      return url;
    }

    const backendOrigin = apiUrl.replace(/\/api\/?$/, "");

    return `${backendOrigin}${url}`;
  }

  return url;
}