import axios from "axios";
import { getCookie } from "@/api/cookie";
import { STATUS_401_UNAUTHORIZED } from "@/constants/statusCode";

axios.defaults.withCredentials = true;

const instance = axios.create({
  baseURL: import.meta.env.VITE_BE_HOST,
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
    if (error.response?.status === STATUS_401_UNAUTHORIZED) {
      window.location.href = "/login";
      alert(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
