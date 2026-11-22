const getEnvVar = (key, fallback = "") => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key] !== undefined) {
      return import.meta.env[key];
    }
  } catch {}
  try {
    if (typeof process !== "undefined" && process.env && process.env[key] !== undefined) {
      return process.env[key];
    }
  } catch {}
  return fallback;
};

export const API_BASE_URL = (getEnvVar("VITE_API_BASE_URL", "http://localhost:5000")).replace(/\/+$/, "");

export const getApiUrl = (endpoint = "") => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export const getAdminToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token") || null;
};

export const setAdminToken = (token) => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("admin_token", token);
  } else {
    localStorage.removeItem("admin_token");
  }
};

export const clearAdminToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
};

export const getAdminAuthHeaders = () => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Safely fetches an API endpoint with fallback between API_BASE_URL and relative path.
 * Validates that the response is actual JSON and not an HTML error/fallback page (e.g. <!doctype).
 *
 * @param {string} endpoint - e.g. "/api/result?pin=..."
 * @param {RequestInit} [options] - fetch options
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function safeFetchJson(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Build candidate URLs in order of preference
  const candidateUrls = [];
  const customBase = getEnvVar("VITE_API_BASE_URL", "");
  const isProd = getEnvVar("PROD", false) || getEnvVar("NODE_ENV", "") === "production";

  if (customBase && API_BASE_URL) {
    candidateUrls.push(`${API_BASE_URL}${cleanEndpoint}`);
    candidateUrls.push(cleanEndpoint);
  } else if (!isProd) {
    // Local dev: express backend on port 5000 is primary
    if (API_BASE_URL) candidateUrls.push(`${API_BASE_URL}${cleanEndpoint}`);
    candidateUrls.push(cleanEndpoint);
  } else {
    // Production default: relative first (e.g. Vercel serverless), then API_BASE_URL
    candidateUrls.push(cleanEndpoint);
    if (API_BASE_URL) {
      candidateUrls.push(`${API_BASE_URL}${cleanEndpoint}`);
    }
  }

  // Deduplicate
  const uniqueUrls = [...new Set(candidateUrls)];

  let lastError = null;

  for (const url of uniqueUrls) {
    try {
      const targetUrl =
        url.startsWith("/") && typeof window === "undefined"
          ? `${API_BASE_URL || "http://localhost:5000"}${url}`
          : url;
      const response = await fetch(targetUrl, options);

      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();

      // Check if response is HTML (e.g. <!DOCTYPE html> or <html...>)
      const trimmed = text.trim();
      const isHtml =
        trimmed.startsWith("<!") ||
        trimmed.startsWith("<html") ||
        trimmed.startsWith("<?xml") ||
        contentType.includes("text/html");

      if (isHtml) {
        lastError = new Error(
          `Endpoint ${url} returned an HTML document instead of JSON (HTTP ${response.status}).`
        );
        continue;
      }

      let parsedData;
      try {
        parsedData = JSON.parse(text);
      } catch (parseErr) {
        lastError = new Error(
          `Failed to parse JSON response from ${url}: ${parseErr.message}`
        );
        continue;
      }

      return {
        ok: response.ok,
        status: response.status,
        data: parsedData,
      };
    } catch (netErr) {
      lastError = netErr;
    }
  }

  const errorMessage =
    lastError?.message?.includes("HTML document")
      ? "Unable to fetch result: API returned an invalid response. Please verify backend status."
      : lastError?.message || "Failed to connect to API service.";

  throw new Error(errorMessage);
}

export default API_BASE_URL;
