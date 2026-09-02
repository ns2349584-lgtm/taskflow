import { useEffect, useState } from "react";
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
  },
  {
    id: 2,
    title: "Build Navbar",
    description: "Create responsive navigation for the application.",
    priority: "Med",
    hours: 2,
    status: "progress",
  },
  {
    id: 3,
    title: "Project Setup",
    description: "Initialize React project and configure basic files.",
    priority: "Low",
    hours: 1,
    status: "done",
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

function App() {
  /* =====================================
     TASK STATE
  ===================================== */

  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);

      if (savedTasks) {
        return JSON.parse(savedTasks);
      }

      return initialTasks;
    } catch (error) {
      console.error("Could not load tasks:", error);
      return initialTasks;
    }
  });

  /* =====================================
     UI STATE
  ===================================== */

  const [showDrawer, setShowDrawer] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Med",
    hours: "",
  });

  /* =====================================
     LOCAL STORAGE
  ===================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
      );
    } catch (error) {
      console.error("Could not save tasks:", error);
    }
  }, [tasks]);

  /* =====================================
     FORM CHANGE
  ===================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================
     OPEN ADD DRAWER
  ===================================== */

  const openAddDrawer = () => {
    setEditingTask(null);

    setFormData({
      title: "",
      description: "",
      priority: "Med",
      hours: "",
    });

    setShowDrawer(true);
  };

  /* =====================================
     OPEN EDIT DRAWER
  ===================================== */

  const openEditDrawer = (task) => {
    setEditingTask(task);

    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      hours: task.hours,
    });

    setShowDrawer(true);
  };

  /* =====================================
     CLOSE DRAWER
  ===================================== */

  const closeDrawer = () => {
    setShowDrawer(false);
    setEditingTask(null);

    setFormData({
      title: "",
      description: "",
      priority: "Med",
      hours: "",
    });
  };

  /* =====================================
     CREATE / UPDATE TASK
  ===================================== */

  const handleSubmit = (event) => {
    event.preventDefault();

    const title = formData.title.trim();
    const description = formData.description.trim();
    const hours = Number(formData.hours);

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

    /* UPDATE */

    if (editingTask) {
      setTasks((previousTasks) =>
        previousTasks.map((task) => {
          if (task.id !== editingTask.id) {
            return task;
          }

          return {
            ...task,
            title,
            description,
            priority: formData.priority,
            hours,
          };
        })
      );
    }

    /* CREATE */

    else {
      const newTask = {
        id: Date.now(),
        title,
        description,
        priority: formData.priority,
        hours,
        status: "todo",
      };

      setTasks((previousTasks) => [
        ...previousTasks,
        newTask,
      ]);
    }

    closeDrawer();
  };

  /* =====================================
     DELETE TASK
  ===================================== */

  const deleteTask = (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    setTasks((previousTasks) =>
      previousTasks.filter(
        (task) => task.id !== taskId
      )
    );
  };

  /* =====================================
     MOVE TASK
  ===================================== */

  const moveTask = (taskId, newStatus) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        return {
          ...task,
          status: newStatus,
        };
      })
    );
  };

  /* =====================================
     DRAG START
  ===================================== */

  const handleDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };

  /* =====================================
     DRAG END
  ===================================== */

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  /* =====================================
     DRAG OVER
  ===================================== */

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  /* =====================================
     DROP
  ===================================== */

  const handleDrop = (status) => {
    if (draggedTaskId === null) {
      return;
    }

    moveTask(draggedTaskId, status);
    setDraggedTaskId(null);
  };

  /* =====================================
     RENDER
  ===================================== */

  return (
    <div className="app">

      {/* Background */}

      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      {/* =================================
          NAVBAR
      ================================= */}

      <header className="navbar">

        <div className="brand-area">
          <h1 className="logo">
            Task<span>Flow</span>
          </h1>

          <p className="tagline">
            Plan. Build. Complete.
          </p>
        </div>

        <button
          type="button"
          className="add-task-btn"
          onClick={openAddDrawer}
        >
          <span>+</span>
          Add Task
        </button>

      </header>

      {/* =================================
          WORKSPACE
      ================================= */}

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

        {/* =================================
            KANBAN
        ================================= */}

        <section className="kanban-board">

          {columns.map((column) => {

            const columnTasks = tasks.filter(
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

                {/* Column Header */}

                <div className="column-header">

                  <div>
                    <h3>{column.title}</h3>

                    <p>{column.subtitle}</p>
                  </div>

                  <span className="column-count">
                    {columnTasks.length}
                  </span>

                </div>

                {/* Task List */}

                <div className="tasks-container">

                  {columnTasks.length === 0 ? (

                    <div className="empty-state">
                      {draggedTaskId !== null
                        ? "Drop task here"
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

      {/* =================================
          DRAWER
      ================================= */}

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

            {/* Drawer Header */}

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

            {/* Form */}

            <form
              className="task-form"
              onSubmit={handleSubmit}
            >

              {/* Title */}

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

              {/* Description */}

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

              {/* Priority */}

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

              {/* Hours */}

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

              {/* Form Buttons */}

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

/* =====================================
   TASK CARD COMPONENT
===================================== */

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

  return (
    <article
      className={`task-card ${
        isDragging ? "dragging" : ""
      }`}
      draggable={true}
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
    >

      {/* Top */}

      <div className="task-card-top">

        <span
          className={`priority-badge ${task.priority.toLowerCase()}`}
        >
          {task.priority}
        </span>

        <div className="task-actions">

          <button
            type="button"
            className="icon-btn"
            onClick={() => onEdit(task)}
            title="Edit task"
          >
            ✎
          </button>

          <button
            type="button"
            className="icon-btn delete-icon"
            onClick={() => onDelete(task.id)}
            title="Delete task"
          >
            ×
          </button>

        </div>

      </div>

      {/* Content */}

      <h4>{task.title}</h4>

      <p className="task-description">
        {task.description}
      </p>

      {/* Footer */}

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

      {/* Move Buttons */}

      <div className="move-actions">

        {previousColumn[task.status] && (
          <button
            type="button"
            className="move-btn"
            onClick={() =>
              onMove(
                task.id,
                previousColumn[task.status]
              )
            }
          >
            ← Move Back
          </button>
        )}

        {nextColumn[task.status] && (
          <button
            type="button"
            className="move-btn move-next"
            onClick={() =>
              onMove(
                task.id,
                nextColumn[task.status]
              )
            }
          >
            Move →
          </button>
        )}

      </div>

      <div className="drag-hint">
        ⋮⋮ Drag card to move ⋮⋮
      </div>

    </article>
  );
}

export default App;