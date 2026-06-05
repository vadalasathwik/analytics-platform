import axios from "axios";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://analytics-platform-production-78b2.up.railway.app"
    : "http://127.0.0.1:8000");

const api = axios.create({
  baseURL: API_URL,
});

export default api;