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
} from "./api/tasks";

const AUTH_KEY = "tm_auth_user_v1";
const safeJsonParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    return safeJsonParse(localStorage.getItem(AUTH_KEY), null);
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
    queueMicrotask(() => {
      if (cancelled) return;
      setIsLoadingTasks(true);
      setTasksError("");
    });
    getTasks()
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .catch((err) => {
        setTasks([]);
        setTasksError(
          err?.message ||
            "Failed to load tasks. Make sure Django is running on port 8000.",
        );
      })
      .finally(() => {
        queueMicrotask(() => {
          if (cancelled) return;
          setIsLoadingTasks(false);
        });
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const onLogin = (payload) => {
    const nextUser = { username: payload.username };
    setUser(nextUser);
    setTasks([]);
    setEditingTask(null);
    setSearch("");
    setStatusFilter("All");
    setPageSize(6);
    setPage(1);
    setTasksError("");
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(nextUser));
    } catch {
      // ignore
    }
  };

  const onLogout = () => {
    setUser(null);
    setTasks([]);
    setEditingTask(null);
    setSearch("");
    setStatusFilter("All");
    setPageSize(6);
    setPage(1);
    setTasksError("");
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
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
            setSearch={(v) => {
              setSearch(v);
              setPage(1);
            }}
            statusFilter={statusFilter}
            setStatusFilter={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            pageSize={pageSize}
            setPageSize={(v) => {
              setPageSize(v);
              setPage(1);
            }}
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
