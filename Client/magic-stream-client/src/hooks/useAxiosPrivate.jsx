import { useCallback, useEffect } from 'react';
import axiosPrivate from '../api/axiosPrivateConfig';
import useAuth from './useAuth';

const useAxiosPrivate = () => {
    const { setAuth } = useAuth();

    const handleRefreshFailure = useCallback(() => {
        localStorage.removeItem('user');
        setAuth(null);
    }, [setAuth]);

    useEffect(() => {
        let isRefreshing = false;
        let failedQueue = [];

        const processQueue = (error) => {
            failedQueue.forEach((promise) => {
                if (error) {
                    promise.reject(error);
                    return;
                }
                promise.resolve();
            });

            failedQueue = [];
        };

        const responseInterceptor = axiosPrivate.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (!originalRequest) {
                    return Promise.reject(error);
                }

                if (originalRequest.url?.includes('/refresh') && error.response?.status === 401) {
                    handleRefreshFailure();
                    return Promise.reject(error);
                }

                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        }).then(() => axiosPrivate(originalRequest));
                    }

                    originalRequest._retry = true;
                    isRefreshing = true;

                    try {
                        await axiosPrivate.post('/refresh');
                        processQueue(null);
                        return axiosPrivate(originalRequest);
                    } catch (refreshError) {
                        processQueue(refreshError);
                        handleRefreshFailure();
                        return Promise.reject(refreshError);
                    } finally {
                        isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.response.eject(responseInterceptor);
        };
    }, [handleRefreshFailure]);

    return axiosPrivate;
};

export default useAxiosPrivate;
