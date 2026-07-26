import axios from "axios";

const readCookie = (name) =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1] || "";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://atsmind-ai.onrender.com",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const method = String(config.method || "get").toLowerCase();

  if (!["get", "head", "options"].includes(method)) {
    const csrfToken = readCookie("csrf_token");

    if (csrfToken) {
      config.headers["x-csrf-token"] = decodeURIComponent(csrfToken);
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
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
      await api.post("/api/auth/refresh");
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
