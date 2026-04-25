import { useEffect } from "react";
import axiosPrivate from "../api/axiosPrivateConfig";
import useAuth from "./useAuth";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }

    resolve();
  });

  failedQueue = [];
};

const useAxiosPrivate = () => {
  const { setAuth } = useAuth();

  useEffect(() => {
    const responseInterceptor = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config ?? {};
        const status = error.response?.status;

        if (!status) {
          return Promise.reject(error);
        }

        if (originalRequest.url?.includes("/refresh") && status === 401) {
          setAuth(null);
          processQueue(error);
          return Promise.reject(error);
        }

        if (status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => axiosPrivate(originalRequest));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await axiosPrivate.post("/refresh");
          processQueue(null);
          return axiosPrivate(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          setAuth(null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      },
    );

    return () => {
      axiosPrivate.interceptors.response.eject(responseInterceptor);
    };
  }, [setAuth]);

  return axiosPrivate;
};

export default useAxiosPrivate;
