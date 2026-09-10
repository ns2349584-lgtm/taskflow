import { useEffect, useRef, useState } from "react";
import "./App.css";

const STORAGE_KEY = "taskflow_tasks";

const initialTasks = [
  {
    id: 1,
    title: "Design Dashboard",
    description: "Create the main dashboard UI for TaskFlow.",
    priority: "High",
    hours: 4,
    status: "todo",
    tags: ["UI", "Design"],
  },
  {
    id: 2,
    title: "Build Navbar",
    description: "Create responsive navigation for the application.",
    priority: "Med",
    hours: 2,
    status: "progress",
    tags: ["Frontend"],
  },
  {
    id: 3,
    title: "Project Setup",
    description: "Initialize React project and configure basic files.",
    priority: "Low",
    hours: 1,
    status: "done",
    tags: ["Setup"],
  },
];

const columns = [
  {
    id: "todo",
    title: "To Do",
    subtitle: "Things that need to be done",
  },
  {
    id: "progress",
    title: "In Progress",
    subtitle: "Currently working on",
  },
  {
    id: "done",
    title: "Done",
    subtitle: "Completed tasks",
  },
];

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];

  return tags
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 8);
};

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);

      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);

        if (Array.isArray(parsedTasks)) {
          return parsedTasks.map((task) => ({
            ...task,
            tags: normalizeTags(task.tags),
          }));
        }
      }

      return initialTasks;
    } catch (error) {
      console.error("Could not load tasks:", error);
      return initialTasks;
    }
  });

  const [showDrawer, setShowDrawer] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Med",
    hours: "",
    tags: "",
  });

  const importInputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Could not save tasks:", error);
    }
  }, [tasks]);

  const allTags = [
    ...new Set(tasks.flatMap((task) => normalizeTags(task.tags))),
  ].sort();

  const filteredTasks = tasks.filter((task) => {
    const search = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !search ||
      task.title.toLowerCase().includes(search) ||
      task.description.toLowerCase().includes(search) ||
      normalizeTags(task.tags).some((tag) =>
        tag.toLowerCase().includes(search)
      );

    const matchesPriority =
      priorityFilter === "All" ||
      task.priority === priorityFilter;

    const matchesTag =
      tagFilter === "All" ||
      normalizeTags(task.tags).includes(tagFilter);

    return matchesSearch && matchesPriority && matchesTag;
  });

  const completedCount = tasks.filter(
    (task) => task.status === "done"
  ).length;

  const progressPercentage =
    tasks.length === 0
      ? 0
      : Math.round((completedCount / tasks.length) * 100);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddDrawer = () => {
    setEditingTask(null);

    setFormData({
      title: "",
      description: "",
      priority: "Med",
      hours: "",
      tags: "",
    });

    setShowDrawer(true);
  };

  const openEditDrawer = (task) => {
    setEditingTask(task);

    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      hours: task.hours,
      tags: normalizeTags(task.tags).join(", "),
    });

    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setEditingTask(null);

    setFormData({
      title: "",
      description: "",
      priority: "Med",
      hours: "",
      tags: "",
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const title = formData.title.trim();
    const description = formData.description.trim();
    const hours = Number(formData.hours);

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 8);

    if (!title) {
      alert("Please enter a task title.");
      return;
    }

    if (!description) {
      alert("Please enter a description.");
      return;
    }

    if (!hours || hours <= 0) {
      alert("Please enter valid estimated hours.");
      return;
    }

    if (editingTask) {
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                title,
                description,
                priority: formData.priority,
                hours,
                tags,
              }
            : task
        )
      );
    } else {
      const newTask = {
        id: Date.now(),
        title,
        description,
        priority: formData.priority,
        hours,
        status: "todo",
        tags,
      };

      setTasks((previousTasks) => [
        ...previousTasks,
        newTask,
      ]);
    }

    closeDrawer();
  };

  const deleteTask = (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== taskId)
    );
  };

  const moveTask = (taskId, newStatus) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus }
          : task
      )
    );
  };

  const handleDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (status) => {
    if (draggedTaskId === null) return;

    moveTask(draggedTaskId, status);
    setDraggedTaskId(null);
  };

  const exportTasks = () => {
    const exportData = {
      app: "TaskFlow",
      version: "Week 3",
      exportedAt: new Date().toISOString(),
      tasks,
    };

    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `taskflow-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const openImportPicker = () => {
    importInputRef.current?.click();
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      const importedTasks = Array.isArray(importedData)
        ? importedData
        : importedData.tasks;

      if (!Array.isArray(importedTasks)) {
        throw new Error("Invalid task data");
      }

      const validTasks = importedTasks
        .filter(
          (task) =>
            task &&
            task.title &&
            task.description &&
            task.status
        )
        .map((task, index) => ({
          id:
            typeof task.id === "number"
              ? task.id
              : Date.now() + index,
          title: String(task.title),
          description: String(task.description),
          priority: ["High", "Med", "Low"].includes(
            task.priority
          )
            ? task.priority
            : "Med",
          hours: Number(task.hours) > 0
            ? Number(task.hours)
            : 1,
          status: ["todo", "progress", "done"].includes(
            task.status
          )
            ? task.status
            : "todo",
          tags: normalizeTags(task.tags),
        }));

      if (validTasks.length === 0) {
        throw new Error("No valid tasks found");
      }

      const confirmed = window.confirm(
        `Import ${validTasks.length} task(s) and replace your current board?`
      );

      if (!confirmed) {
        event.target.value = "";
        return;
      }

      setTasks(validTasks);

      alert(
        `${validTasks.length} task(s) imported successfully.`
      );
    } catch (error) {
      console.error("Import failed:", error);

      alert(
        "Import failed. Please select a valid TaskFlow JSON file."
      );
    }

    event.target.value = "";
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriorityFilter("All");
    setTagFilter("All");
  };

  return (
    <div className="app">
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <header className="navbar">
        <div className="brand-area">
          <h1 className="logo">
            Task<span>Flow</span>
          </h1>

          <p className="tagline">
            Plan. Build. Complete.
          </p>
        </div>

        <div className="navbar-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={openImportPicker}
          >
            ↓ Import
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={exportTasks}
            disabled={tasks.length === 0}
          >
            ↑ Export
          </button>

          <button
            type="button"
            className="add-task-btn"
            onClick={openAddDrawer}
          >
            <span>+</span>
            Add Task
          </button>
        </div>

        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden-file-input"
          onChange={handleImport}
        />
      </header>

      <main className="workspace">
        <div className="workspace-heading">
          <div>
            <h2>Sprint Board</h2>

            <p>
              Manage your tasks and keep your sprint moving.
            </p>
          </div>

          <div className="task-count">
            {tasks.length}{" "}
            {tasks.length === 1 ? "Task" : "Tasks"}
          </div>
        </div>

        {/* =========================
            PROGRESS
        ========================= */}

        <section className="progress-panel">
          <div className="progress-info">
            <div>
              <span className="progress-label">
                Sprint Progress
              </span>

              <strong>
                {progressPercentage}% Complete
              </strong>
            </div>

            <span className="progress-summary">
              {completedCount} of {tasks.length} completed
            </span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${progressPercentage}%`,
              }}
            ></div>
          </div>
        </section>

        {/* =========================
            SEARCH + FILTERS
        ========================= */}

        <section className="toolbar">
          <div className="search-box">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="Search tasks, descriptions or tags..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
            />

            {searchQuery && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="filter-group">
            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Med">Med</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={tagFilter}
              onChange={(event) =>
                setTagFilter(event.target.value)
              }
            >
              <option value="All">All Tags</option>

              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            {(searchQuery ||
              priorityFilter !== "All" ||
              tagFilter !== "All") && (
              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                Clear
              </button>
            )}
          </div>
        </section>

        <div className="results-info">
          Showing{" "}
          <strong>{filteredTasks.length}</strong> of{" "}
          <strong>{tasks.length}</strong> tasks
        </div>

        {/* =========================
            KANBAN BOARD
        ========================= */}

        <section className="kanban-board">
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter(
              (task) => task.status === column.id
            );

            return (
              <div
                className={`kanban-column ${
                  draggedTaskId !== null
                    ? "drag-active"
                    : ""
                }`}
                key={column.id}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                <div className="column-header">
                  <div>
                    <h3>{column.title}</h3>

                    <p>{column.subtitle}</p>
                  </div>

                  <span className="column-count">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="tasks-container">
                  {columnTasks.length === 0 ? (
                    <div className="empty-state">
                      {draggedTaskId !== null
                        ? "Drop task here"
                        : searchQuery ||
                          priorityFilter !== "All" ||
                          tagFilter !== "All"
                        ? "No matching tasks"
                        : "No tasks here"}
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={openEditDrawer}
                        onDelete={deleteTask}
                        onMove={moveTask}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isDragging={
                          draggedTaskId === task.id
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* =========================
          DRAWER
      ========================= */}

      {showDrawer && (
        <div
          className="drawer-overlay"
          onClick={closeDrawer}
        >
          <aside
            className="task-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="drawer-header">
              <div>
                <h2>
                  {editingTask
                    ? "Edit Task"
                    : "Create New Task"}
                </h2>

                <p>
                  {editingTask
                    ? "Update your task details."
                    : "Add a task to your sprint board."}
                </p>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={closeDrawer}
              >
                ×
              </button>
            </div>

            <form
              className="task-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label htmlFor="title">
                  Task Title
                </label>

                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Build Login Page"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what needs to be done..."
                  rows="5"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">
                    Urgency
                  </label>

                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="High">
                      High
                    </option>

                    <option value="Med">
                      Med
                    </option>

                    <option value="Low">
                      Low
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="hours">
                    Estimated Hours
                  </label>

                  <input
                    id="hours"
                    type="number"
                    name="hours"
                    min="0.5"
                    step="0.5"
                    value={formData.hours}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="tags">
                  Tags
                </label>

                <input
                  id="tags"
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g. UI, Frontend, Urgent"
                />

                <small className="form-help">
                  Separate multiple tags with commas.
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeDrawer}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                >
                  {editingTask
                    ? "Save Changes"
                    : "Add Task"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onMove,
  onDragStart,
  onDragEnd,
  isDragging,
}) {
  const previousColumn = {
    todo: null,
    progress: "todo",
    done: "progress",
  };

  const nextColumn = {
    todo: "progress",
    progress: "done",
    done: null,
  };

  const getNextLabel = () => {
    if (task.status === "todo") {
      return "In Progress";
    }

    if (task.status === "progress") {
      return "Done";
    }

    return "";
  };

  const getPreviousLabel = () => {
    if (task.status === "progress") {
      return "To Do";
    }

    if (task.status === "done") {
      return "In Progress";
    }

    return "";
  };

  return (
    <article
      className={`task-card ${
        isDragging ? "dragging" : ""
      }`}
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
    >
      <div className="task-card-top">
        <span
          className={`priority-badge ${task.priority.toLowerCase()}`}
        >
          {task.priority}
        </span>

        <div className="task-actions">
          <button
            type="button"
            className="card-action edit-action"
            onClick={() => onEdit(task)}
            title="Edit task"
          >
            ✎
          </button>

          <button
            type="button"
            className="card-action delete-action"
            onClick={() => onDelete(task.id)}
            title="Delete task"
          >
            🗑
          </button>
        </div>
      </div>

      <h4>{task.title}</h4>

      <p className="task-description">
        {task.description}
      </p>

      {normalizeTags(task.tags).length > 0 && (
        <div className="task-tags">
          {normalizeTags(task.tags).map((tag) => (
            <span className="task-tag" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="task-footer">
        <div className="time-info">
          <span>◷</span>

          {task.hours}{" "}
          {Number(task.hours) === 1
            ? "hour"
            : "hours"}
        </div>

        <div className="task-status-dot"></div>
      </div>

      <div className="move-controls">
        {previousColumn[task.status] ? (
          <button
            type="button"
            className="move-control move-back"
            onClick={() =>
              onMove(
                task.id,
                previousColumn[task.status]
              )
            }
          >
            <span className="move-arrow">
              ←
            </span>

            <span>{getPreviousLabel()}</span>
          </button>
        ) : (
          <div className="move-placeholder"></div>
        )}

        {nextColumn[task.status] ? (
          <button
            type="button"
            className="move-control move-forward"
            onClick={() =>
              onMove(
                task.id,
                nextColumn[task.status]
              )
            }
          >
            <span>{getNextLabel()}</span>

            <span className="move-arrow">
              →
            </span>
          </button>
        ) : (
          <div className="move-placeholder"></div>
        )}
      </div>

      <div className="drag-hint">
        ⋮⋮ Drag to move
      </div>
    </article>
  );
}

export default App;