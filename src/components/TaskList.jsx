import { useState, useRef } from "react";
import Confetti from "react-confetti";

function PriorityBadge({ priority }) {
  return (
    <span
      style={{
        background: "#f3f4f6",
        color:
          priority === "high"
            ? "#ef4444"
            : priority === "medium"
            ? "#f59e0b"
            : "#22c55e",
        padding: "4px 10px",
        borderRadius: 8,
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {priority}
    </span>
  );
}
function TaskCard({ task, onEdit, onComplete }) {
  const [removing, setRemoving] = useState(false);

  const completeTask = () => {
    if(removing) return;
    
    setRemoving(true);
    onComplete(task);
    };

  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 18,
        borderLeft: `5px solid ${
          task.priority === "high"
            ? "#ef4444"
            : task.priority === "medium"
            ? "#f59e0b"
            : "#22c55e"
        }`,
        boxShadow: "0 6px 18px rgba(0,0,0,.05)",
        opacity: removing ? 0 : 1,
        transform: removing
          ? "translateX(80px) scale(.95)"
          : "translateX(0) scale(1)",
        transition: "all .45s",
      }}
    >
      <div style={styles.header}>
        <button
          onClick={completeTask}
          title="Complete & Delete"
          style={styles.circleBtn}
        >
          ✓
        </button>

        <h3 style={{ margin: 0, flex: 1 }}>
          {task.title}
        </h3>

        <button
          onClick={() => onEdit(task)}
          style={styles.iconBtn}
        >
          ✏️
        </button>
      </div>

      <div style={styles.badges}>
        <PriorityBadge priority={task.priority} />
        <span>{task.category}</span>
        <span>{task.status}</span>
      </div>

      {task.description && (
        <p style={styles.desc}>
          {task.description}
        </p>
      )}
            {task.notes && (
        <div style={styles.notes}>
          📝 {task.notes}
        </div>
      )}

      {task.due_date && (
        <div style={styles.footer}>
          📅 {task.due_date}
        </div>
      )}
    </div>
  );
}

function TaskList({ tasks, onEdit, onComplete }) {
  const [undoTask, setUndoTask] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [hiddenTasks, setHiddenTasks] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const popRef = useRef(
    new Audio("/pop.mp3")
   );
   
   const playPop = () => {
    try{
      popRef.current.currentTime = 0;
      popRef.current.play();
    } catch(e){
      console.log(e);
    }
   };

  const completeWithUndo = (task) => {
    playPop();
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
    }, 2000);

    setHiddenTasks((prev) => [...prev, task.id]);

    setUndoTask(task);
    setShowToast(true);

    undoTimer.current = setTimeout(async () => {

      await onComplete(task.id,false);
      
      setHiddenTasks(prev =>
       prev.filter(id => id !== task.id)
      );
      
      setShowToast(false);
      setUndoTask(null);
      
      },5000);
  };
  const undoAction = () => {
    if (!undoTask) return;

    clearTimeout(undoTimer.current);

    const taskId = undoTask.id;

    setHiddenTasks((prev) =>
      prev.filter((id) => id !== taskId)
    );

    onComplete(taskId, "undo");

    setShowToast(false);
    setUndoTask(null);
  };

  const visibleTasks = tasks.filter(
    (t) => !hiddenTasks.includes(t.id)
  );

  return (
    <>
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {visibleTasks.length === 0 && (
          <p>No tasks yet.</p>
        )}

        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onComplete={completeWithUndo}
          />
        ))}
      </div>

      {showToast && undoTask && (
        <div style={styles.toast}>
          <span>🎉 Task completed</span>

          <button
            onClick={undoAction}
            style={styles.undoBtn}
          >
            Undo
          </button>
        </div>
      )}
    </>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "2px solid #22c55e",
    background: "#ecfdf5",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 16,
  },
  iconBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 16,
  },

  badges: {
    display: "flex",
    gap: 10,
    marginTop: 12,
    fontSize: 13,
    color: "#6b7280",
  },

  desc: {
    marginTop: 14,
    color: "#6b7280",
  },

  notes: {
    marginTop: 12,
    background: "#fff7ed",
    padding: 10,
    borderRadius: 8,
  },

  footer: {
    marginTop: 14,
    fontSize: 12,
    color: "#6b7280",
  },

  toast: {
    position: "fixed",
    bottom: 30,
    right: 30,
    background: "#111827",
    color: "white",
    padding: "15px 18px",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    gap: 14,
    boxShadow: "0 8px 24px rgba(0,0,0,.2)",
    zIndex: 9999,
  },

  undoBtn: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default TaskList;