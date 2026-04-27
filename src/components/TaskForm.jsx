import { useState } from "react";

function TaskForm({ onSubmit, editingTask, onCancelEdit }) {
  const [formData, setFormData] = useState(() =>
    editingTask
      ? editingTask
      : {
          title: "",
          description: "",
          status: "Pending",
        },
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Promise.resolve(onSubmit(formData)).then(() => {
      setFormData({
        title: "",
        description: "",
        status: "Pending",
      });
    });

  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-title">
        <h2>{editingTask ? "Edit Task" : "Add Task"}</h2>
        <p className="muted">
          {editingTask ? "Update details and save changes." : "Create a new task."}
        </p>
      </div>
      <input
        type="text"
        name="title"
        placeholder="Task Title"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Task Description"
        value={formData.description}
        onChange={handleChange}
      />

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
      >
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      <div className="form-actions">
        {editingTask && (
          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              onCancelEdit?.();
              setFormData({
                title: "",
                description: "",
                status: "Pending",
              });
            }}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="primary-btn">
          {editingTask ? "Save Changes" : "Add Task"}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;