import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://kaampaas.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("KaamPaas_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
