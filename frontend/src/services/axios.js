import axios from "axios";

const readCookie = (name) =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1] || "";

const readCsrfToken = () =>
  readCookie("csrf_token") || localStorage.getItem("csrf_token") || "";

const defaultApiBaseUrl = (() => {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }

  if (hostname.endsWith(".vercel.app")) {
    return "";
  }

  return "https://atsmind-ai.onrender.com";
})();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const method = String(config.method || "get").toLowerCase();

  if (!["get", "head", "options"].includes(method)) {
    const csrfToken = readCsrfToken();

    if (csrfToken) {
      config.headers["x-csrf-token"] = decodeURIComponent(csrfToken);
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const csrfToken = response.data?.csrfToken;

    if (csrfToken) {
      localStorage.setItem("csrf_token", csrfToken);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !url.includes("/api/auth/login") &&
      !url.includes("/api/auth/signup") &&
      !url.includes("/api/auth/refresh")
    ) {
      originalRequest._retry = true;
      const response = await api.post("/api/auth/refresh");
      const csrfToken = response.data?.csrfToken;

      if (csrfToken) {
        localStorage.setItem("csrf_token", csrfToken);
      }

      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
