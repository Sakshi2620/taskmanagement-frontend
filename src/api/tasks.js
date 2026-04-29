import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  timeout: 15000,
});

// ── Attach token to every request automatically ──────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers["Authorization"] = `Token ${token}`;
  }
  return config;
});

// ── Task endpoints ────────────────────────────────────────────
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

// ── Auth endpoints ────────────────────────────────────────────
export async function register(payload) {
  const res = await api.post("/auth/register/", payload);
  return res.data;
}

export async function login(payload) {
  const res = await api.post("/auth/login/", payload);
  // Save token immediately after login
  if (res.data.token) {
    localStorage.setItem("auth_token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }
  return res.data;
}

export async function logout() {
  try {
    await api.post("/auth/logout/");
  } finally {
    // Always clear local storage on logout
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }
}

export async function getCurrentUser() {
  const res = await api.get("/auth/me/");
  return res.data;
}