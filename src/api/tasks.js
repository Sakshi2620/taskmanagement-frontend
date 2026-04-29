import axios from "axios";

const API = axios.create({
 baseURL:"http://127.0.0.1:8000/api"
});

API.interceptors.request.use(config=>{
 const token = localStorage.getItem("auth_token");

 if(token){
   config.headers.Authorization=`Token ${token}`;
 }

 return config;
});


export const login = async(data)=>{
 const res = await API.post(
   "/auth/login/",
   data
 );

 localStorage.setItem(
   "auth_token",
   res.data.token
 );

 return res.data;
};


export const register=(data)=>
API.post(
 "/auth/register/",
 data
);


export const logout = async()=>{
 await API.post("/auth/logout/");
 localStorage.removeItem("auth_token");
};


export const getTasks = async()=>{
 const res=await API.get("/tasks/");
 return res.data;
};


export const createTask = async(data)=>{
 const res=await API.post(
  "/tasks/",
  data
 );
 return res.data;
};


export const updateTask = async(id,data)=>{
 const res=await API.put(
   `/tasks/${id}/`,
   data
 );
 return res.data;
};


export const deleteTask = (id)=>
API.delete(`/tasks/${id}/`);