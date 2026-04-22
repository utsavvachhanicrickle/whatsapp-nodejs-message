import axios from "axios";

// Create Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
  failedQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve();
  });
  failedQueue = [];
};

// Response interceptor to handle 401 (access token expired)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry once and skip refresh for refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes(APIENDPOINTS.REFRESHTOKEN)
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request while token is refreshing
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
          await API.get("/user/refresh");
          processQueue();
          resolve(API(originalRequest));
        } catch (err) {
          processQueue(err);
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
 

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authData: JSON.parse(localStorage.getItem("profile")) || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      if (!action.payload) return;
      localStorage.setItem("profile", JSON.stringify(action.payload));
      console.log(action);

      state.authData = action.payload;
    },
    logout: (state) => {
      localStorage.removeItem("profile");
      state.authData = null;
    },
  },
});

export const { setAuth, logout } = authSlice.actions;

export default authSlice.reducer;
 i neds to connectes this both such as the in web load everytime this checkout this first user existes or not if not hen directlyy first removed this profile stored in the local