const statusNode = document.querySelector("#status");
const boardNode = document.querySelector("#kanban-board");
const priorityFilter = document.querySelector("#priority-filter");
const statusFilter = document.querySelector("#status-filter");
const assigneeFilter = document.querySelector("#assignee-filter");

const columnOrder = [
  { key: "OPEN", label: "To Do", dotClass: "todo-column" },
  { key: "IN_PROGRESS", label: "In Progress", dotClass: "in-progress-column" },
  { key: "COMPLETED", label: "Completed", dotClass: "completed-column" },
  { key: "ON_HOLD", label: "On Hold", dotClass: "on-hold-column" }
];

let currentTasks = [];

function toTitleCase(value) {
  if (!value) return "";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeStatus(status) {
  const normalized = (status || "").toUpperCase();
  if (normalized === "OPEN") return "OPEN";
  if (normalized === "IN_PROGRESS" || normalized === "INPROGRESS") return "IN_PROGRESS";
  if (normalized === "DONE" || normalized === "COMPLETED") return "COMPLETED";
  if (normalized === "ON_HOLD" || normalized === "HOLD") return "ON_HOLD";
  return "OPEN";
}

function formatPriority(priority) {
  return (priority || "low").toUpperCase();
}

function getAssignee(task) {
  if (!task || !task.title) return "Demo User";
  const assigneeMap = {
    "Implement login": "Arun Janardhanan",
    "Improve error handling": "Demo User",
    "Add API documentation": "Demo User",
    "Fix button alignment": "Demo User",
    "Update user profile": "Arun Janardhanan"
  };
  return assigneeMap[task.title] || "Demo User";
}

function getInitials(name) {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "A";
}

async function loadUserProfile() {
  try {
    const response = await fetch("/api/users/current");
    if (!response.ok) {
      throw new Error("User profile unavailable");
    }
    const user = await response.json();
    const displayName = user?.name || "Demo User";
    const role = user?.role || "Project Lead";

    document.querySelector("#user-name").textContent = displayName;
    document.querySelector("#user-role").textContent = role;
    document.querySelector("#welcome-name").textContent = displayName;
    document.querySelector("#user-avatar").textContent = getInitials(displayName);
  } catch (error) {
    document.querySelector("#user-name").textContent = "Demo User";
    document.querySelector("#user-role").textContent = "Project Lead";
    document.querySelector("#welcome-name").textContent = "Demo User";
    document.querySelector("#user-avatar").textContent = "DU";
  }
}

function renderStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => normalizeStatus(task.status) === "COMPLETED").length;
  const inProgress = tasks.filter((task) => normalizeStatus(task.status) === "IN_PROGRESS").length;
  const todo = tasks.filter((task) => normalizeStatus(task.status) === "OPEN").length;

  document.querySelector("#total-tasks").textContent = total;
  document.querySelector("#completed-tasks").textContent = completed;
  document.querySelector("#in-progress-tasks").textContent = inProgress;
  document.querySelector("#todo-tasks").textContent = todo;
}

function applyClientFilters(tasks) {
  const selectedStatus = statusFilter.value || "ALL";
  const selectedAssignee = assigneeFilter.value || "ALL";

  return tasks.filter((task) => {
    const matchesStatus = selectedStatus === "ALL" || normalizeStatus(task.status) === selectedStatus;
    const matchesAssignee = selectedAssignee === "ALL" || getAssignee(task) === selectedAssignee;
    return matchesStatus && matchesAssignee;
  });
}

function renderBoard(tasks) {
  const columns = columnOrder.map((column) => {
    const items = tasks.filter((task) => normalizeStatus(task.status) === column.key);
    return { ...column, items };
  });

  boardNode.innerHTML = columns
    .map((column) => `
      <section class="kanban-column ${column.dotClass}" aria-label="${column.label}">
        <div class="column-header">
          <div class="column-title">
            <span class="column-dot" aria-hidden="true"></span>${column.label}
          </div>
          <span class="column-count">${column.items.length}</span>
        </div>
        <div class="task-list">
          ${column.items
            .map(
              (task) => `
                <article class="task-card priority-${(task.priority || "medium").toLowerCase()}">
                  <span class="priority-badge">${formatPriority(task.priority)}</span>
                  <h3 class="task-title">${task.title}</h3>
                  <p class="task-description">${task.description}</p>
                  <div class="task-meta">
                    <span class="task-project"><span class="project-tag"></span>${task.title.includes("login") ? "SCRUM-5" : task.title.includes("profile") ? "SCRUM-4" : task.title.includes("button") ? "SCRUM-9" : task.title.includes("API") ? "SCRUM-6" : "SCRUM-1"}</span>
                    <div class="task-metrics">
                      <span>⏱ ${(task.title.includes("login") ? 4 : task.title.includes("handling") ? 2 : 1)}h</span>
                      <span>◌ ${(task.priority === "HIGH" ? 3 : task.priority === "MEDIUM" ? 1 : 0)}</span>
                      <span>◍ ${(task.title.includes("login") ? 2 : 0)}</span>
                    </div>
                  </div>
                </article>
              `
            )
            .join("")}
          <button class="add-task" type="button">+ Add Task</button>
        </div>
      </section>
    `)
    .join("");
}

async function loadTasks() {
  const priority = priorityFilter.value.trim();
  const query = priority ? `?priority=${encodeURIComponent(priority)}` : "";

  statusNode.textContent = "Loading tasks…";
  try {
    const response = await fetch(`/api/tasks${query}`);
    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          message = errorData.message;
        } else if (errorData?.error) {
          message = errorData.error;
        }
      } catch (error) {
        // Ignore JSON parse failures and return the status-based message.
      }
      throw new Error(message);
    }

    currentTasks = await response.json();
    const filteredTasks = applyClientFilters(currentTasks);
    renderStats(currentTasks);
    renderBoard(filteredTasks);

    const countText = currentTasks.length === 1 ? "1 task loaded" : `${currentTasks.length} tasks loaded`;
    statusNode.textContent = countText;
  } catch (error) {
    statusNode.textContent = `Unable to load tasks: ${error.message}`;
    boardNode.innerHTML = "";
  }
}

document.querySelector("#apply-filter").addEventListener("click", () => {
  loadTasks();
});

document.querySelector("#clear-filter").addEventListener("click", () => {
  priorityFilter.value = "";
  statusFilter.value = "ALL";
  assigneeFilter.value = "ALL";
  loadTasks();
});

document.querySelector("#reload")?.addEventListener("click", () => {
  loadTasks();
});

statusFilter.addEventListener("change", () => {
  if (currentTasks.length > 0) {
    renderBoard(applyClientFilters(currentTasks));
  }
});

assigneeFilter.addEventListener("change", () => {
  if (currentTasks.length > 0) {
    renderBoard(applyClientFilters(currentTasks));
  }
});

priorityFilter.addEventListener("change", () => {
  loadTasks();
});

loadUserProfile();
loadTasks();
