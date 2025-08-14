// src/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5001/api/tasks", // change this to your actual backend URL
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
