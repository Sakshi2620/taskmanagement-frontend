import "./App.css";
import { useEffect, useMemo, useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import SearchBar from "./components/SearchBar";
import Login from "./components/Login";
import Pagination from "./components/Pagination";
import {
  createTask,
  deleteTask as apiDeleteTask,
  getTasks,
  updateTask,
  logout as apiLogout,
} from "./api/tasks";

const AUTH_KEY = "tm_auth_user_v1";
const TOKEN_KEY = "auth_token"; // must match what axios interceptor reads

const safeJsonParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

function App() {
  // Restore user AND verify token both exist — if token missing, force logout
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem(TOKEN_KEY);
    const savedUser = safeJsonParse(localStorage.getItem(AUTH_KEY), null);
    // Only restore session if both token and user are present
    return token && savedUser ? savedUser : null;
  });

  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pageSize, setPageSize] = useState(6);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setIsLoadingTasks(true);
    setTasksError("");
    getTasks()
      .then((data) => {
        if (!cancelled) setTasks(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setTasks([]);
          // If 401, token expired — force logout
          if (err?.response?.status === 401) {
            handleClearSession();
          } else {
            setTasksError(
              err?.message || "Failed to load tasks. Make sure Django is running on port 8000."
            );
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingTasks(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  const handleClearSession = () => {
    setUser(null);
    setTasks([]);
    setEditingTask(null);
    setSearch("");
    setStatusFilter("All");
    setPageSize(6);
    setPage(1);
    setTasksError("");
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const onLogin = (payload, token) => {
    const nextUser = {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name,
    };
    setUser(nextUser);
    setTasks([]);
    setEditingTask(null);
    setSearch("");
    setStatusFilter("All");
    setPageSize(6);
    setPage(1);
    setTasksError("");
    localStorage.setItem(AUTH_KEY, JSON.stringify(nextUser));
    // Token is already saved inside tasks.js login() — just ensure it's there
  };

  const onLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    }
    handleClearSession();
  };

  const saveTask = async (task) => {
    if (editingTask) {
      const updated = await updateTask(editingTask.id, task);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTask(null);
    } else {
      const created = await createTask(task);
      setTasks((prev) => [created, ...prev]);
    }
  };

  const deleteTask = async (id) => {
    if (!confirm("Delete this task?")) return;
    await apiDeleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesQuery =
        !q ||
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [search, statusFilter, tasks]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedTasks = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, pageSize, safePage]);

  const completed = tasks.filter((t) => t.status === "Completed").length;

  if (!user) {
    return <Login onLogin={onLogin} />;
  }

  return (
    <div className="app">
      <div className="header">
        <div className="title">
          <h1>Task Management</h1>
          <p>
            Welcome, <strong>{user.username}</strong>. Stay focused and ship.
          </p>
        </div>
        <div className="stats">
          <div className="stat-card">
            <small>Total</small>
            <h2>{tasks.length}</h2>
          </div>
          <div className="stat-card">
            <small>Done</small>
            <h2>{completed}</h2>
          </div>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard">
        <div>
          <TaskForm
            key={editingTask?.id ?? "new"}
            onSubmit={saveTask}
            editingTask={editingTask}
            onCancelEdit={() => setEditingTask(null)}
          />
        </div>
        <div className="tasks-panel">
          <h2 className="panel-title" style={{ color: "#111827" }}>
            My Tasks
          </h2>

          {tasksError && <div className="empty">{tasksError}</div>}
          {isLoadingTasks && <div className="empty">Loading tasks…</div>}

          <SearchBar
            search={search}
            setSearch={(v) => { setSearch(v); setPage(1); }}
            statusFilter={statusFilter}
            setStatusFilter={(v) => { setStatusFilter(v); setPage(1); }}
            pageSize={pageSize}
            setPageSize={(v) => { setPageSize(v); setPage(1); }}
          />

          {!isLoadingTasks && !tasksError && filteredTasks.length ? (
            <TaskList
              tasks={pagedTasks}
              onEdit={setEditingTask}
              onDelete={deleteTask}
            />
          ) : !isLoadingTasks && !tasksError ? (
            <div className="empty">No tasks yet. Add your first task.</div>
          ) : null}

          {!isLoadingTasks && !tasksError && filteredTasks.length > 0 && (
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
