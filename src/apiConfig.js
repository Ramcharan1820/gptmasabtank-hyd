export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");

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

export default API_BASE_URL;
