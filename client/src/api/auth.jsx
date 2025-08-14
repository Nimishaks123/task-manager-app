import axios from "axios";
const API = "http://localhost:5001/api/auth";

export const register = async (data) => axios.post(`${API}/register`, data);
export const login = async (data) => axios.post(`${API}/login`, data);