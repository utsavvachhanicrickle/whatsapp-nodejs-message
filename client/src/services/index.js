import axios from "axios";
import { logout } from "../store/slices/authSlices";
import toast from "../utils/Toast";

const API = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 (unauthorized)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/api/user/refresh")
    ) {
      originalRequest._retry = true;

      // If refresh already running → queue requests
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(API(originalRequest)),
            reject,
          });
        });
      }

      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          // 🔥 Call refresh endpoint (cookie-based)
          await API.get("/api/user/refresh");

          processQueue(); // resolve queued requests

          resolve(API(originalRequest));
        } catch (err) {
          processQueue(err);
          toast.success("Logout SuccessFull !!!");
          localStorage.removeItem("profile");
          
          // Use dynamic import to avoid circular dependency
          import("../store/store").then((m) => {
             m.store.dispatch(logout());
          });
          
          reject(err);
        } finally {
          isRefreshing = false;
        }
      });
    }

    return Promise.reject(error);
  },
);

export default API;
