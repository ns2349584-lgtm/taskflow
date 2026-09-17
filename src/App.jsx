import { useEffect, useState } from "react";
import "./App.css";

const TASKS_KEY = "taskflow_tasks";
const ACTIVITY_KEY = "taskflow_activity";

let nextTaskId = 1000;
let nextActivityId = 1000;

const createTaskId = () => {
  const id = `task-${nextTaskId}`;
  nextTaskId += 1;
  return id;
};

const createActivityId = () => {
  const id = `activity-${nextActivityId}`;
  nextActivityId += 1;
  return id;
};

const columns = [
  {
    id: "todo",
    title: "To Do",
    icon: "📝",
  },
  {
    id: "progress",
    title: "In Progress",
    icon: "⚡",
  },
  {
    id: "done",
    title: "Done",
    icon: "✅",
  },
];

const initialTasks = [
  {
    id: "task-1",
    title: "Design landing page",
    description:
      "Create the main landing page layout and responsive design.",
    priority: "High",
    hours: 4,
    status: "todo",
    tags: ["Design", "Frontend"],
    dueDate: "2026-09-20",
  },
  {
    id: "task-2",
    title: "Build dashboard",
    description:
      "Create dashboard cards and sprint progress section.",
    priority: "Medium",
    hours: 6,
    status: "progress",
    tags: ["React", "UI"],
    dueDate: "2026-09-18",
  },
  {
    id: "task-3",
    title: "Project setup",
    description:
      "Initialize the TaskFlow project and configure basic styling.",
    priority: "Low",
    hours: 2,
    status: "done",
    tags: ["Setup"],
    dueDate: "2026-09-15",
  },
];

const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  hours: 1,
  status: "todo",
  tags: "",
  dueDate: "",
};

const confettiPieces = [
  { left: "5%", delay: "0s", duration: "2.2s", rotate: "15deg" },
  { left: "10%", delay: "0.2s", duration: "2.5s", rotate: "45deg" },
  { left: "15%", delay: "0.4s", duration: "2.1s", rotate: "80deg" },
  { left: "20%", delay: "0.1s", duration: "2.4s", rotate: "120deg" },
  { left: "25%", delay: "0.3s", duration: "2.6s", rotate: "160deg" },
  { left: "30%", delay: "0.5s", duration: "2.2s", rotate: "200deg" },
  { left: "35%", delay: "0.15s", duration: "2.7s", rotate: "240deg" },
  { left: "40%", delay: "0.35s", duration: "2.3s", rotate: "280deg" },
  { left: "45%", delay: "0.05s", duration: "2.5s", rotate: "320deg" },
  { left: "50%", delay: "0.25s", duration: "2.1s", rotate: "30deg" },
  { left: "55%", delay: "0.45s", duration: "2.6s", rotate: "70deg" },
  { left: "60%", delay: "0.15s", duration: "2.4s", rotate: "110deg" },
  { left: "65%", delay: "0.35s", duration: "2.2s", rotate: "150deg" },
  { left: "70%", delay: "0.05s", duration: "2.7s", rotate: "190deg" },
  { left: "75%", delay: "0.25s", duration: "2.3s", rotate: "230deg" },
  { left: "80%", delay: "0.45s", duration: "2.5s", rotate: "270deg" },
  { left: "85%", delay: "0.1s", duration: "2.1s", rotate: "310deg" },
  { left: "90%", delay: "0.3s", duration: "2.6s", rotate: "350deg" },
  { left: "95%", delay: "0.2s", duration: "2.4s", rotate: "60deg" },
  { left: "12%", delay: "0.6s", duration: "2.8s", rotate: "100deg" },
  { left: "32%", delay: "0.7s", duration: "2.5s", rotate: "140deg" },
  { left: "52%", delay: "0.55s", duration: "2.7s", rotate: "180deg" },
  { left: "72%", delay: "0.65s", duration: "2.3s", rotate: "220deg" },
  { left: "92%", delay: "0.75s", duration: "2.6s", rotate: "260deg" },
];

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter(Boolean);
  }

  return String(tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  if (!dateString) {
    return "No deadline";
  }

  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function isOverdue(task) {
  if (!task.dueDate) {
    return false;
  }

  if (task.status === "done") {
    return false;
  }

  return task.dueDate < getToday();
}

function playCompletionSound() {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const audioContext = new AudioContextClass();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      660,
      audioContext.currentTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      990,
      audioContext.currentTime + 0.12
    );

    gain.gain.setValueAtTime(
      0.0001,
      audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.15,
      audioContext.currentTime + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + 0.25
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(
      audioContext.currentTime + 0.25
    );

    oscillator.onended = () => {
      audioContext.close();
    };
  } catch {
    // Sound is optional.
  }
}

function loadTasks() {
  try {
    const saved = localStorage.getItem(TASKS_KEY);

    if (!saved) {
      return initialTasks;
    }

    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return initialTasks;
  } catch {
    return initialTasks;
  }
}

function loadActivity() {
  try {
    const saved = localStorage.getItem(ACTIVITY_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [];
  } catch {
    return [];
  }
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onMove,
  onDragStart,
}) {
  const overdue = isOverdue(task);

  return (
    <article
      className={`task-card ${
        overdue ? "task-overdue" : ""
      }`}
      draggable
      onDragStart={() => onDragStart(task.id)}
    >
      <div className="task-card-top">
        <span
          className={`priority priority-${task.priority.toLowerCase()}`}
        >
          {task.priority}
        </span>

        {overdue && (
          <span className="overdue-badge">
            ⚠ Overdue
          </span>
        )}
      </div>

      <h3>{task.title}</h3>

      {task.description && (
        <p className="task-description">
          {task.description}
        </p>
      )}

      <div className="task-meta">
        <span>⏱ {task.hours}h</span>

        {task.dueDate && (
          <span
            className={
              overdue ? "deadline-overdue" : ""
            }
          >
            📅 {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {task.tags?.length > 0 && (
        <div className="task-tags">
          {task.tags.map((tag) => (
            <span
              className="task-tag"
              key={`${task.id}-${tag}`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="task-actions">
        {task.status !== "todo" && (
          <button
            type="button"
            onClick={() =>
              onMove(task.id, "todo")
            }
            title="Move to To Do"
          >
            ←
          </button>
        )}

        {task.status !== "progress" && (
          <button
            type="button"
            onClick={() =>
              onMove(task.id, "progress")
            }
            title="Move to In Progress"
          >
            →
          </button>
        )}

        {task.status !== "done" && (
          <button
            type="button"
            onClick={() =>
              onMove(task.id, "done")
            }
            title="Mark as Done"
          >
            ✓
          </button>
        )}

        <button
          type="button"
          onClick={() => onEdit(task)}
          title="Edit task"
        >
          ✏️
        </button>

        <button
          type="button"
          className="delete-btn"
          onClick={() => onDelete(task.id)}
          title="Delete task"
        >
          🗑
        </button>
      </div>
    </article>
  );
}

function App() {
  /*
    IMPORTANT:
    Initial state is loaded directly through the
    useState initializer.

    This avoids calling setState synchronously
    inside useEffect.
  */
  const [tasks, setTasks] = useState(loadTasks);
  const [activity, setActivity] =
    useState(loadActivity);

  const [isDrawerOpen, setIsDrawerOpen] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState(null);

  const [draggedTaskId, setDraggedTaskId] =
    useState(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [tagFilter, setTagFilter] =
    useState("All");

  const [formData, setFormData] =
    useState(emptyForm);

  const [showActivity, setShowActivity] =
    useState(false);

  const [celebration, setCelebration] =
    useState(null);

  /*
    SAVE TASKS
  */
  useEffect(() => {
    try {
      localStorage.setItem(
        TASKS_KEY,
        JSON.stringify(tasks)
      );
    } catch {
      // Ignore storage errors.
    }
  }, [tasks]);

  /*
    SAVE ACTIVITY
  */
  useEffect(() => {
    try {
      localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify(activity)
      );
    } catch {
      // Ignore storage errors.
    }
  }, [activity]);

  /*
    Auto hide celebration.
    No synchronous state update here.
  */
  useEffect(() => {
    if (!celebration) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCelebration(null);
    }, 2800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [celebration]);

  const addActivity = (message) => {
    const newActivity = {
      id: createActivityId(),
      message,
      timestamp: new Date().toLocaleString(),
    };

    setActivity((previous) =>
      [newActivity, ...previous].slice(0, 50)
    );
  };

  const openCreateDrawer = () => {
    setEditingTask(null);
    setFormData(emptyForm);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (task) => {
    setEditingTask(task);

    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      hours: task.hours || 1,
      status: task.status || "todo",
      tags: (task.tags || []).join(", "),
      dueDate: task.dueDate || "",
    });

    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingTask(null);
    setFormData(emptyForm);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const title = formData.title.trim();

    if (!title) {
      return;
    }

    if (editingTask) {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                title,
                description:
                  formData.description.trim(),
                priority: formData.priority,
                hours:
                  Number(formData.hours) || 1,
                status: formData.status,
                tags: normalizeTags(
                  formData.tags
                ),
                dueDate: formData.dueDate,
              }
            : task
        )
      );

      addActivity(
        `Edited task "${title}"`
      );
    } else {
      const newTask = {
        id: createTaskId(),
        title,
        description:
          formData.description.trim(),
        priority: formData.priority,
        hours:
          Number(formData.hours) || 1,
        status: formData.status,
        tags: normalizeTags(formData.tags),
        dueDate: formData.dueDate,
      };

      setTasks((previous) => [
        ...previous,
        newTask,
      ]);

      addActivity(
        `Created task "${title}"`
      );

      if (newTask.status === "done") {
        playCompletionSound();
        setCelebration("task");
      }
    }

    closeDrawer();
  };

  const deleteTask = (taskId) => {
    const task = tasks.find(
      (item) => item.id === taskId
    );

    if (!task) {
      return;
    }

    setTasks((previous) =>
      previous.filter(
        (item) => item.id !== taskId
      )
    );

    addActivity(
      `Deleted task "${task.title}"`
    );
  };

  const moveTask = (taskId, newStatus) => {
    const task = tasks.find(
      (item) => item.id === taskId
    );

    if (!task) {
      return;
    }

    if (task.status === newStatus) {
      return;
    }

    const wasDone = task.status === "done";
    const isDone = newStatus === "done";

    setTasks((previous) =>
      previous.map((item) =>
        item.id === taskId
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    if (isDone && !wasDone) {
      addActivity(
        `Completed task "${task.title}"`
      );

      playCompletionSound();

      const allTasksDone = tasks.every(
        (item) =>
          item.id === taskId ||
          item.status === "done"
      );

      if (allTasksDone) {
        addActivity(
          "🎉 Sprint completed — all tasks are Done!"
        );

        setCelebration("sprint");
      } else {
        setCelebration("task");
      }

      return;
    }

    const destination =
      columns.find(
        (column) => column.id === newStatus
      )?.title || newStatus;

    addActivity(
      `Moved task "${task.title}" to ${destination}`
    );
  };

  const handleDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (status) => {
    if (!draggedTaskId) {
      return;
    }

    moveTask(draggedTaskId, status);
    setDraggedTaskId(null);
  };

  const allTags = Array.from(
    new Set(
      tasks.flatMap((task) =>
        normalizeTags(task.tags)
      )
    )
  );

  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    const matchesSearch =
      !query ||
      task.title
        .toLowerCase()
        .includes(query) ||
      task.description
        .toLowerCase()
        .includes(query) ||
      normalizeTags(task.tags).some(
        (tag) =>
          tag.toLowerCase().includes(query)
      );

    const matchesPriority =
      priorityFilter === "All" ||
      task.priority === priorityFilter;

    const matchesTag =
      tagFilter === "All" ||
      normalizeTags(task.tags).includes(
        tagFilter
      );

    return (
      matchesSearch &&
      matchesPriority &&
      matchesTag
    );
  });

  const completedCount = tasks.filter(
    (task) => task.status === "done"
  ).length;

  const totalTasks = tasks.length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedCount / totalTasks) * 100
        );

  const overdueCount = tasks.filter(
    (task) => isOverdue(task)
  ).length;

  const clearFilters = () => {
    setSearchQuery("");
    setPriorityFilter("All");
    setTagFilter("All");
  };

  const clearActivity = () => {
    setActivity([]);
  };

  const exportTasks = () => {
    const exportData = {
      tasks,
      activity,
      exportedAt:
        new Date().toLocaleString(),
    };

    const blob = new Blob(
      [
        JSON.stringify(
          exportData,
          null,
          2
        ),
      ],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "taskflow-backup.json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    addActivity(
      "Exported TaskFlow data"
    );
  };

  const importTasks = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = (loadEvent) => {
      try {
        const imported = JSON.parse(
          loadEvent.target.result
        );

        if (Array.isArray(imported)) {
          setTasks(imported);

          addActivity(
            "Imported tasks successfully"
          );
        } else if (
          imported &&
          Array.isArray(imported.tasks)
        ) {
          setTasks(imported.tasks);

          if (
            Array.isArray(
              imported.activity
            )
          ) {
            setActivity(
              imported.activity
            );
          }

          addActivity(
            "Imported TaskFlow backup successfully"
          );
        } else {
          alert(
            "Invalid TaskFlow JSON file."
          );
        }
      } catch {
        alert(
          "Could not read the JSON file."
        );
      }
    };

    reader.readAsText(file);

    event.target.value = "";
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>TaskFlow</h1>
          <p>Sprint workspace</p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            onClick={() =>
              setShowActivity(
                (previous) => !previous
              )
            }
          >
            📋 Activity
          </button>

          <button
            type="button"
            onClick={exportTasks}
          >
            ⬇ Export
          </button>

          <label className="import-button">
            ⬆ Import

            <input
              type="file"
              accept=".json,application/json"
              onChange={importTasks}
              hidden
            />
          </label>

          <button
            type="button"
            className="primary-btn"
            onClick={openCreateDrawer}
          >
            + New Task
          </button>
        </div>
      </header>

      <section className="dashboard">
        <div className="dashboard-card">
          <span>Total Tasks</span>
          <strong>{totalTasks}</strong>
        </div>

        <div className="dashboard-card">
          <span>Completed</span>
          <strong>
            {completedCount}
          </strong>
        </div>

        <div className="dashboard-card">
          <span>Overdue</span>

          <strong
            className={
              overdueCount > 0
                ? "danger-number"
                : ""
            }
          >
            {overdueCount}
          </strong>
        </div>

        <div className="dashboard-card progress-card">
          <div className="progress-header">
            <span>Sprint Progress</span>

            <strong>
              {progress}%
            </strong>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="filters">
        <div className="search-box">
          🔎

          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(
              event.target.value
            )
          }
        >
          <option value="All">
            All Priorities
          </option>

          <option value="High">
            High
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="Low">
            Low
          </option>
        </select>

        <select
          value={tagFilter}
          onChange={(event) =>
            setTagFilter(
              event.target.value
            )
          }
        >
          <option value="All">
            All Tags
          </option>

          {allTags.map((tag) => (
            <option
              key={tag}
              value={tag}
            >
              {tag}
            </option>
          ))}
        </select>

        {(searchQuery ||
          priorityFilter !== "All" ||
          tagFilter !== "All") && (
          <button
            type="button"
            onClick={clearFilters}
          >
            Clear
          </button>
        )}
      </section>

      <div className="workspace">
        <main className="board">
          {columns.map((column) => {
            const columnTasks =
              filteredTasks.filter(
                (task) =>
                  task.status ===
                  column.id
              );

            return (
              <section
                className="board-column"
                key={column.id}
                onDragOver={
                  handleDragOver
                }
                onDrop={() =>
                  handleDrop(
                    column.id
                  )
                }
              >
                <div className="column-header">
                  <div>
                    <span className="column-icon">
                      {column.icon}
                    </span>

                    <h2>
                      {column.title}
                    </h2>
                  </div>

                  <span className="column-count">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="task-list">
                  {columnTasks.length ===
                  0 ? (
                    <div className="empty-column">
                      <span>
                        📭
                      </span>

                      <p>
                        No tasks here
                      </p>
                    </div>
                  ) : (
                    columnTasks.map(
                      (task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={
                            openEditDrawer
                          }
                          onDelete={
                            deleteTask
                          }
                          onMove={
                            moveTask
                          }
                          onDragStart={
                            handleDragStart
                          }
                        />
                      )
                    )
                  )}
                </div>
              </section>
            );
          })}
        </main>

        {showActivity && (
          <aside className="activity-panel">
            <div className="activity-header">
              <div>
                <h2>
                  Activity Log
                </h2>

                <p>
                  Recent sprint actions
                </p>
              </div>

              <button
                type="button"
                onClick={
                  clearActivity
                }
              >
                Clear
              </button>
            </div>

            <div className="activity-list">
              {activity.length ===
              0 ? (
                <div className="empty-activity">
                  No activity yet.
                </div>
              ) : (
                activity.map(
                  (item) => (
                    <div
                      className="activity-item"
                      key={item.id}
                    >
                      <span className="activity-dot" />

                      <div>
                        <p>
                          {item.message}
                        </p>

                        <small>
                          {
                            item.timestamp
                          }
                        </small>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </aside>
        )}
      </div>

      {isDrawerOpen && (
        <div
          className="drawer-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDrawer();
            }
          }}
        >
          <aside className="task-drawer">
            <div className="drawer-header">
              <div>
                <h2>
                  {editingTask
                    ? "Edit Task"
                    : "Create Task"}
                </h2>

                <p>
                  Add details for your
                  sprint task.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
              >
                ✕
              </button>
            </div>

            <form
              className="task-form"
              onSubmit={
                handleSubmit
              }
            >
              <label>
                Title

                <input
                  type="text"
                  name="title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Task title"
                  required
                />
              </label>

              <label>
                Description

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Describe the task..."
                  rows="4"
                />
              </label>

              <div className="form-grid">
                <label>
                  Priority

                  <select
                    name="priority"
                    value={
                      formData.priority
                    }
                    onChange={
                      handleInputChange
                    }
                  >
                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>
                  </select>
                </label>

                <label>
                  Estimated Hours

                  <input
                    type="number"
                    name="hours"
                    min="1"
                    step="1"
                    value={
                      formData.hours
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                </label>
              </div>

              <div className="form-grid">
                <label>
                  Status

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleInputChange
                    }
                  >
                    <option value="todo">
                      To Do
                    </option>

                    <option value="progress">
                      In Progress
                    </option>

                    <option value="done">
                      Done
                    </option>
                  </select>
                </label>

                <label>
                  Due Date

                  <input
                    type="date"
                    name="dueDate"
                    value={
                      formData.dueDate
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                </label>
              </div>

              <label>
                Tags

                <input
                  type="text"
                  name="tags"
                  value={
                    formData.tags
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="React, Frontend, Design"
                />

                <small>
                  Separate tags with
                  commas.
                </small>
              </label>

              <div className="drawer-actions">
                <button
                  type="button"
                  onClick={
                    closeDrawer
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  {editingTask
                    ? "Save Changes"
                    : "Create Task"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {celebration && (
        <div className="celebration-overlay">
          <div className="celebration-message">
            <div className="celebration-icon">
              {celebration ===
              "sprint"
                ? "🏆"
                : "🎉"}
            </div>

            <h2>
              {celebration ===
              "sprint"
                ? "Sprint Complete!"
                : "Task Completed!"}
            </h2>

            <p>
              {celebration ===
              "sprint"
                ? "Amazing! All tasks are done."
                : "Great work! Keep going."}
            </p>
          </div>

          <div className="confetti-container">
            {confettiPieces.map(
              (piece, index) => (
                <span
                  className="confetti-piece"
                  key={`confetti-${index}`}
                  style={{
                    left: piece.left,
                    animationDelay:
                      piece.delay,
                    animationDuration:
                      piece.duration,
                    transform: `rotate(${piece.rotate})`,
                  }}
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;