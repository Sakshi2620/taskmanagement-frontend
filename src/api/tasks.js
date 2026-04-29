import axios from "axios";

const API_URL = "https://taskmanagement-backend-ykcq.onrender.com/api";


export const register = async(data)=>{
  const res = await api.post("/auth/register/", data);
  return res.data;
 };
const api = axios.create({
 baseURL: API_URL,
 headers:{
   "Content-Type":"application/json"
 }
});

api.interceptors.request.use((config)=>{
 const token = localStorage.getItem("auth_token");

 if(token){
   config.headers.Authorization = `Token ${token}`;
 }

 return config;
});

export const login = async(data)=>{
 const res = await api.post("/auth/login/",data);
 return res.data;
};

export const logout = async()=>{
 return await api.post("/auth/logout/");
};

export const getTasks = async()=>{
 const res = await api.get("/tasks/");
 return res.data;
};

export const createTask = async(data)=>{
 const res = await api.post("/tasks/",data);
 return res.data;
};

export const updateTask = async(id,data)=>{
 const res = await api.put(`/tasks/${id}/`,data);
 return res.data;
};

export const deleteTask = async(id)=>{
 return await api.delete(`/tasks/${id}/`);
};