import axios from "axios";
import { getCookie } from "@/api/cookie";
import {
  STATUS_401_UNAUTHORIZED,
  STATUS_403_FORBIDDEN,
} from "@/constants/statusCode";
import { gotoPage } from "@/lib/libft";

axios.defaults.withCredentials = true;

const instance = axios.create({
  baseURL: "https://10.31.5.2",
  // baseURL: import.meta.env.VITE_BE_HOST,
  withCredentials: true,
});

// instance.interceptors.request.use(async (config) => {
//   return config;
// });

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response?.status === STATUS_401_UNAUTHORIZED ||
      error.response?.status === STATUS_403_FORBIDDEN
    ) {
      // alert(error.response.data.message);
      gotoPage("/");
    }
    return Promise.reject(error);
  }
);

export default instance;
