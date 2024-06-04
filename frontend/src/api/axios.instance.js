import axios from "axios";
import { getCookie } from "@/api/cookie";
import {
  STATUS_401_UNAUTHORIZED,
  STATUS_403_FORBIDDEN,
} from "@/constants/statusCode";

axios.defaults.withCredentials = true;

const instance = axios.create({
  baseURL: "http://localhost:8000",
  // baseURL: import.meta.env.VITE_BE_HOST,
  withCredentials: true,
});

instance.interceptors.request.use(async (config) => {
  const token = getCookie("access_token");
  config.headers = {
    Authorization: `Bearer ${token}`,
  };
  return config;
});

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response?.status === STATUS_401_UNAUTHORIZED ||
      error.response?.status === STATUS_403_FORBIDDEN
    ) {
      window.location.href = "/";
      alert(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default instance;