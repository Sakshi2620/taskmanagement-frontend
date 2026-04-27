import { FiEdit2, FiTrash2 } from "react-icons/fi";

function TaskList({ tasks, onEdit, onDelete }) {
  return (
    <div className="task-grid" role="list">
      {tasks.map((task) => (
        <div key={task.id} className="task-card" role="listitem">
          <div className="task-top">
            <div className="task-title-wrap">
              <h3 className="task-title">{task.title}</h3>
              <span
                className={[
                  "status",
                  task.status === "Pending"
                    ? "pending"
                    : task.status === "In Progress"
                      ? "progress"
                      : "completed",
                ].join(" ")}
              >
                {task.status}
              </span>
            </div>
            <p className="task-desc">{task.description || "—"}</p>
          </div>

          <div className="actions">
            <button className="edit-btn" onClick={() => onEdit(task)}>
              <FiEdit2 aria-hidden="true" /> Edit
            </button>
            <button className="delete-btn" onClick={() => onDelete(task.id)}>
              <FiTrash2 aria-hidden="true" /> Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskList;