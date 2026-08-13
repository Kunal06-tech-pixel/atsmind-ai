import axios from "axios";

const hostname = window.location.hostname;
const defaultApiBaseUrl =
  hostname === "localhost" || hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : hostname.endsWith(".vercel.app")
      ? ""
      : "https://atsmind-ai.onrender.com";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
