import "./App.css";
import { useEffect, useMemo, useState } from "react";

import Login from "./components/Login";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import SearchBar from "./components/SearchBar";
import Pagination from "./components/Pagination";

import {
 login,
 logout as apiLogout,
 getTasks,
 createTask,
 updateTask,
 deleteTask as apiDeleteTask
} from "./api/tasks";

const AUTH_KEY="tm_auth_user_v1";
const TOKEN_KEY="auth_token";

const safeParse=(raw,fallback)=>{
 try{
   return raw ? JSON.parse(raw):fallback;
  }
  catch{
    return fallback;
  }
 }
 
 function App(){
 
 const [user,setUser]=useState(()=>{
  const token=localStorage.getItem(TOKEN_KEY);
  const savedUser=safeParse(
  localStorage.getItem(AUTH_KEY),
  null
  )
  return token && savedUser ? savedUser : null;
 })
 
 const [tasks,setTasks]=useState([])
 const [editingTask,setEditingTask]=useState(null)
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState("")
 const [search,setSearch]=useState("")
const [statusFilter,setStatusFilter]=useState("All")

const [pageSize,setPageSize]=useState(6)
const [darkMode,setDarkMode] = useState(
  localStorage.getItem("theme")==="dark"
 );


/* ---------------- LOAD TASKS ---------------- */
useEffect(()=>{
if(!user) return;

let cancelled=false;
setLoading(true)
setError("")

getTasks()
.then(data=>{
 if(!cancelled){
  setTasks(
   Array.isArray(data)
   ? data
   : []
  )
 }
})
.catch(err=>{
  if(cancelled) return;
  
  if(err?.response?.status===401){
  clearSession()
  }
  else{
  setError(
   err?.message ||
   "Failed loading tasks"
  )
  }
  })
  .finally(()=>{
  if(!cancelled){
  setLoading(false)
  }
  })
  return()=>{
    cancelled=true
    }
    
    },[user])
    
    
    /* ---------------- SESSION ---------------- */
    const clearSession=()=>{
    setUser(null)
    setTasks([])
    setEditingTask(null)
    setSearch("")
    setStatusFilter("All")
    setPage(1)
    setError("")
    
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(TOKEN_KEY)
}


const onLogin=(payload)=>{

const nextUser={
id:payload.id,
username:payload.username,
email:payload.email,
first_name:payload.first_name,
last_name:payload.last_name
}

setUser(nextUser)

localStorage.setItem(
AUTH_KEY,
JSON.stringify(nextUser)
)
}


const onLogout=async()=>{
try{
await apiLogout()
}
catch{}

clearSession()
}


/* ---------------- CRUD ---------------- */
const saveTask=async(taskData)=>{

try{
if(editingTask){

const updated=
await updateTask(
editingTask.id,
taskData
)

setTasks(prev=>
  prev.map(task=>
   task.id===updated.id
   ? updated
   : task
  )
  )
  
  setEditingTask(null)
  }
  else{
  
  const created=
  await createTask(taskData)
  
  setTasks(prev=>[
  created,
  ...prev
  ])
  
  }
  }
  catch(err){
  console.error(err)
  }
  
  }
  const deleteTask=async(id)=>{

    if(!window.confirm(
    "Delete this task?"
    )) return;
    
    try{
    await apiDeleteTask(id)
    
    setTasks(prev=>
    prev.filter(
    t=>t.id!==id
    )
    )
    }
    catch(err){
    console.error(err)
    }
    
    }
    
    
    /* ------------ COMPLETE AFTER 5 SEC ----------- */
    const handleComplete = async (taskId, action) => {

      // undo clicked
      if(action === "undo"){
        return;
      }
    
      // after 5 sec permanently delete from backend
      if(action === false){
        try{
          await apiDeleteTask(taskId);
    
          setTasks(prev =>
            prev.filter(t => t.id !== taskId)
          );
    
        }catch(err){
          console.error(err);
        }
    
        return;
      }
    
    };
      
      /* ------------ SEARCH/FILTER ----------- */
      const filteredTasks=useMemo(()=>{
      
      const q=search
      .trim()
      .toLowerCase();
      
      return tasks.filter(task=>{
      
      const matchQuery=
      !q ||
      task.title?.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q)
      
      const matchStatus=
      statusFilter==="All" ||
      task.status===statusFilter
      
      return (
      matchQuery &&
      matchStatus
      )
      
      })
      
      },[
      search,
      statusFilter,
      tasks
      ])
      /* ------------ PAGINATION ----------- */
const totalPages=Math.max(
  1,
  Math.ceil(
  filteredTasks.length/pageSize
  )
  )
  
  const safePage=Math.min(
  page,
  totalPages
  )
  
  const pagedTasks=useMemo(()=>{
  const start=(safePage-1)*pageSize;
  return filteredTasks.slice(
  start,
  start+pageSize
  )
  },[
  filteredTasks,
  pageSize,
  safePage
  ])
  
  
  const completedCount=
  tasks.filter(
  t=>t.status==="done"
  ).length
  
  
  /* ---------- LOGIN SCREEN ---------- */
  if(!user){
    return(
    <Login
    onLogin={onLogin}
    darkMode={darkMode}
    setDarkMode={setDarkMode}
    />
    )
    }
  /* ---------- APP UI ---------- */
return(
  <div
 className="app"
 style={{
   background: darkMode
     ? "#111827"
     : "#f9fafb",
   color: darkMode
     ? "white"
     : "#111827",
   minHeight:"100vh"
 }}
>
  
  <div className="header">
  
  <div className="title">
  <h1>
  Task Management
  </h1>
  <p>
  Welcome,
  <strong>
   {user.username}
  </strong>
  </p>
  </div>
  
  <div className="stats">
  <div className="stat-card">
  <small>Total</small>
  <h2>{tasks.length}</h2>
  </div>
  
  <div className="stat-card">
  <small>Done</small>
  <h2>{completedCount}</h2>
  </div>
  </div>
  
  <div className="header-actions">
  <button
  className="secondary-btn"
  onClick={onLogout}
  >
  Logout
  </button>
  
  </div>
  
  </div>
  <div className="dashboard">

<div>
<TaskForm
key={editingTask?.id || "new"}
onSave={saveTask}
editingTask={editingTask}
onCancel={
()=>setEditingTask(null)
}
/>
</div>


<div className="tasks-panel">

<h2
className="panel-title"
style={{color:'#111827'}}
>
My Tasks
</h2>

{error && (
<div className="empty">
{error}
</div>
)}

{loading && (
<div className="empty">
Loading tasks...
</div>
)}
<SearchBar
search={search}
setSearch={(v)=>{
setSearch(v)
setPage(1)
}}
statusFilter={statusFilter}
setStatusFilter={(v)=>{
setStatusFilter(v)
setPage(1)
}}
pageSize={pageSize}
setPageSize={(v)=>{
setPageSize(v)
setPage(1)
}}
/>


{!loading &&
!error &&
filteredTasks.length>0 &&(

<TaskList
tasks={pagedTasks}
onEdit={setEditingTask}
onDelete={deleteTask}
onComplete={handleComplete}
/>

)}


{!loading &&
!error &&
!filteredTasks.length &&(
<div className="empty">
No tasks yet.
Add your first task.
</div>
)}


{filteredTasks.length>0 &&(
<Pagination
page={safePage}
totalPages={totalPages}
onPageChange={setPage}
/>
)}


</div>
</div>
</div>
)
}

export default App;