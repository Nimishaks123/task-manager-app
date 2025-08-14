// src/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "https://task-manager-app-j9mh.onrender.com/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach token
instance.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default instance;
