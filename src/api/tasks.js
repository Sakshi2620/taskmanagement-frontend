import axios from "axios";

const API_URL="https://taskmanagement-backend-ykcq.onrender.com/api";

const TOKEN_KEY="auth_token";

const api=axios.create({
 baseURL:API_URL,
 headers:{
   "Content-Type":"application/json"
 }
});


/* ---------- AUTO ATTACH TOKEN ---------- */
api.interceptors.request.use(
(config)=>{
 const token=localStorage.getItem(TOKEN_KEY);

 if(token){
   config.headers.Authorization=`Token ${token}`;
 }

 return config;
},
(error)=>Promise.reject(error)
);


/* ---------- AUTO HANDLE 401 ---------- */
api.interceptors.response.use(
(response)=>response,

(error)=>{

 if(error?.response?.status===401){
   localStorage.removeItem("auth_token");
   localStorage.removeItem("tm_auth_user_v1");

   window.location.reload();
 }

 return Promise.reject(error);
}
);


/* ---------- AUTH ---------- */
export const register=async(data)=>{
 const res=await api.post(
 "/auth/register/",
 data
 );
 return res.data;
};


export const login=async(data)=>{

 const res=await api.post(
  "/auth/login/",
  data
 );

 if(res.data?.token){
   localStorage.setItem(
    TOKEN_KEY,
    res.data.token
   );
 }

 return res.data;
};


export const logout=async()=>{
 try{
   await api.post("/auth/logout/");
 }catch(e){}

 localStorage.removeItem(TOKEN_KEY);
 localStorage.removeItem("tm_auth_user_v1");
};


/* ---------- TASKS ---------- */

export const getTasks=async()=>{
 const res=await api.get("/tasks/");
 return res.data;
};

export const createTask=async(data)=>{
 const res=await api.post(
 "/tasks/",
 data
 );
 return res.data;
};

export const updateTask=async(id,data)=>{
 const res=await api.patch(
 `/tasks/${id}/`,
 data
 );
 return res.data;
};

export const deleteTask=async(id)=>{
 await api.delete(
 `/tasks/${id}/`
 );
};