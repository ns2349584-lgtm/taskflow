import { useState } from "react";
import "./App.css";

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

function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [showDrawer, setShowDrawer] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Med",
    hours: "",
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const addTask = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please enter a description.");
      return;
    }

    if (!formData.hours || Number(formData.hours) <= 0) {
      alert("Please enter valid estimated hours.");
      return;
    }

    const newTask = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      hours: Number(formData.hours),
      status: "todo",
    };

    setTasks([...tasks, newTask]);

    setFormData({
      title: "",
      description: "",
      priority: "Med",
      hours: "",
    });

    setShowDrawer(false);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  return (
    <div className="app">

      {/* Background Effects */}
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      {/* Navbar */}
      <header className="navbar">
        <div>
          <h1 className="logo">
            Task<span>Flow</span>
          </h1>

          <p className="tagline">
            Plan. Build. Complete.
          </p>
        </div>

        <button
          className="add-task-btn"
          onClick={() => setShowDrawer(true)}
        >
          <span>+</span>
          Add Task
        </button>
      </header>

      {/* Main Content */}
      <main className="workspace">

        <div className="workspace-heading">
          <div>
            <h2>Sprint Board</h2>
            <p>
              Manage your tasks and keep your sprint moving.
            </p>
          </div>

          <div className="task-count">
            {tasks.length} Tasks
          </div>
        </div>

        {/* Kanban Board */}
        <section className="kanban-board">

          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.id
            );

            return (
              <div className="kanban-column" key={column.id}>

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

                {/* Tasks */}
                <div className="tasks-container">

                  {columnTasks.length === 0 ? (
                    <div className="empty-state">
                      No tasks here
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                      />
                    ))
                  )}

                </div>

              </div>
            );
          })}

        </section>
      </main>

      {/* Drawer Overlay */}
      {showDrawer && (
        <div
          className="drawer-overlay"
          onClick={closeDrawer}
        >

          <aside
            className="task-drawer"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="drawer-header">
              <div>
                <h2>Create New Task</h2>
                <p>Add a task to your sprint board.</p>
              </div>

              <button
                className="close-btn"
                onClick={closeDrawer}
              >
                ×
              </button>
            </div>

            <form
              className="task-form"
              onSubmit={addTask}
            >

              {/* Title */}
              <div className="form-group">
                <label>Task Title</label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Build Login Page"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what needs to be done..."
                  rows="5"
                ></textarea>
              </div>

              {/* Priority */}
              <div className="form-group">
                <label>Urgency</label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="High">High</option>
                  <option value="Med">Med</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Hours */}
              <div className="form-group">
                <label>Estimated Hours</label>

                <input
                  type="number"
                  name="hours"
                  min="0.5"
                  step="0.5"
                  value={formData.hours}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                />
              </div>

              {/* Buttons */}
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
                  Add Task
                </button>

              </div>

            </form>

          </aside>
        </div>
      )}

    </div>
  );
}


/* =========================
   TASK CARD COMPONENT
========================= */

function TaskCard({ task }) {
  return (
    <article className="task-card">

      <div className="task-card-top">

        <span
          className={`priority-badge ${task.priority.toLowerCase()}`}
        >
          {task.priority}
        </span>

        <button className="more-btn">
          ⋮
        </button>

      </div>

      <h4>{task.title}</h4>

      <p className="task-description">
        {task.description}
      </p>

      <div className="task-footer">

        <div className="time-info">
          <span>◷</span>
          {task.hours} {task.hours === 1 ? "hour" : "hours"}
        </div>

        <div className="task-status-dot"></div>

      </div>

    </article>
  );
}

export default App;