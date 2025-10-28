import axios from "axios";
const LOCALHOST = "http://localhost:8000";

const BASE_URL =
  window.location.hostname === "localhost"
    ? LOCALHOST
    : process.env.LOCAL_FRONTEND_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("🟡 Outgoing Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error("🔴 Request Error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("🟢 Incoming Response:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("🔴 Response Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);
export default axiosInstance;
