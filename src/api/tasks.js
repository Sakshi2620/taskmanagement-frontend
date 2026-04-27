import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  timeout: 15000,
});

export async function getTasks() {
  const res = await api.get("/tasks/");
  return res.data;
}

export async function createTask(payload) {
  const res = await api.post("/tasks/", payload);
  return res.data;
}

export async function updateTask(id, payload) {
  const res = await api.patch(`/tasks/${id}/`, payload);
  return res.data;
}

export async function deleteTask(id) {
  await api.delete(`/tasks/${id}/`);
}

