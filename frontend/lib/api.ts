import axios from "axios";

const api = axios.create({
  baseURL: "https://analytics-platform-production-78b2.up.railway.app0",
});

export default api;