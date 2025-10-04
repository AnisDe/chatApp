
import axios from 'axios';
const LOCALHOST = "http://localhost:8000";

const BASE_URL =
  window.location.hostname === "localhost" ? LOCALHOST : process.env.LOCAL_FRONTEND_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
}); 
export default axiosInstance;