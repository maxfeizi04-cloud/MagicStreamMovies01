import axios from "axios";
import apiBaseUrl from "./apiBaseUrl";

const axiosPrivate = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default axiosPrivate;
