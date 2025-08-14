import axios from "axios";
const API = "http://localhost:5001/api/tasks";

export const getTasks = async (token) => axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
export const createTask = async (data, token) => axios.post(API, data, { headers: { Authorization: `Bearer ${token}` } });
export const updateTask = async (id, data, token) => axios.put(`${API}/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
export const deleteTask = async (id, token) => axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
