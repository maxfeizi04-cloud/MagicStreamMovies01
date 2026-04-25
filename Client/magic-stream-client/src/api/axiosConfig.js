import axios from "axios";
import apiBaseUrl from "./apiBaseUrl";

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default axiosClient;
