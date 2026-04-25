const normalizeUrl = (value) => value.replace(/\/+$/, "");

export const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredUrl) {
    return normalizeUrl(configuredUrl);
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const hostname = window.location.hostname || "localhost";
    return `${protocol}//${hostname}:8080`;
  }

  return "http://localhost:8080";
};

const apiBaseUrl = getApiBaseUrl();

export default apiBaseUrl;
