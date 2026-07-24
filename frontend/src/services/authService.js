import api from "./axios";

export const signupUser = (data) => api.post("/api/auth/signup", data);
export const loginUser = (data) => api.post("/api/auth/login", data);
export const refreshSession = () => api.post("/api/auth/refresh");

