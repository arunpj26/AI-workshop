const STATUS_COLUMNS = [
  { key: "OPEN", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "ON_HOLD", label: "On Hold" }
];

const state = {
  tasks: [],
  taskLoadError: "",
  filters: {
    query: "",
    priority: "ALL",
    status: "ALL"
  }
};

function normalizeName(value) {
  if (typeof value !== "string") return "User";
  const trimmed = value.trim();
  return trimmed || "User";
}

function getInitials(name) {
  const cleanName = normalizeName(name);
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function normalizeImageUrl(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  const isHttp = lower.startsWith("http://") || lower.startsWith("https://");
  const isRelative = trimmed.startsWith("/") && !trimmed.startsWith("//");
  return isHttp || isRelative ? trimmed : "";
}

function renderUserProfile(profile = {}) {
  if (!profile || typeof profile !== "object") profile = {};
  const name = normalizeName(profile.name);
  const role = typeof profile.role === "string" && profile.role.trim() ? profile.role.trim() : "Team Member";
  const avatar = document.querySelector("#user-avatar");
  const userName = document.querySelector("#user-name");
  const userRole = document.querySelector("#user-role");
  const welcomeName = document.querySelector("#welcome-name");

  userName.textContent = name;
  userRole.textContent = role;
  welcomeName.textContent = name;

  const imageUrl = normalizeImageUrl(profile.imageUrl);
  avatar.replaceChildren();
  avatar.setAttribute("aria-label", imageUrl ? `${name} profile image` : `${name} initials`);

  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "";
    image.addEventListener("error", () => {
      avatar.classList.remove("has-image");
      avatar.setAttribute("aria-label", `${name} initials`);
      avatar.textContent = getInitials(name);
    }, { once: true });
    avatar.classList.add("has-image");
    avatar.appendChild(image);
  } else {
    avatar.classList.remove("has-image");
    avatar.textContent = getInitials(name);
  }
}

function getVisibleTasks() {
  const query = state.filters.query.trim().toLowerCase();
  const priority = state.filters.priority;
  const status = state.filters.status;

  return state.tasks.filter(task => {
    if (!task || typeof task !== "object") return false;
    const searchableText = [task.title, task.description].filter(value => typeof value === "string").join(" ");
    const matchesQuery = !query || searchableText.toLowerCase().includes(query);
    const matchesPriority = priority === "ALL" || task.priority === priority;
    const matchesStatus = status === "ALL" || task.status === status;
    return matchesQuery && matchesPriority && matchesStatus;
  });
}

function renderSummary(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === "COMPLETED").length;
  const inProgress = tasks.filter(task => task.status === "IN_PROGRESS").length;
  const todo = tasks.filter(task => task.status === "OPEN").length;

  document.querySelector("#total-count").textContent = String(total);
  document.querySelector("#completed-count").textContent = String(completed);
  document.querySelector("#in-progress-count").textContent = String(inProgress);
  document.querySelector("#todo-count").textContent = String(todo);
}

function createTaskCard(task) {
  const card = document.createElement("article");
  const priority = typeof task.priority === "string" ? task.priority.toUpperCase() : "";
  const knownPriority = ["HIGH", "MEDIUM", "LOW"].includes(priority) ? priority.toLowerCase() : "unknown";
  card.className = `task-card task-card--${knownPriority}`;

  const priorityBadge = document.createElement("span");
  priorityBadge.className = `priority-pill priority-pill--${knownPriority}`;
  priorityBadge.textContent = priority || "Priority not set";

  const title = document.createElement("h3");
  title.textContent = task.title || "Untitled task";

  card.append(priorityBadge, title);

  if (typeof task.description === "string" && task.description.trim()) {
    const description = document.createElement("p");
    description.textContent = task.description;
    card.appendChild(description);
  }

  if (task.id !== undefined && task.id !== null) {
    const taskId = document.createElement("span");
    taskId.className = "task-id";
    taskId.textContent = `Task ${task.id}`;
    card.appendChild(taskId);
  }
  return card;
}

function renderBoard(tasks) {
  const board = document.querySelector("#board-grid");
  board.replaceChildren();

  STATUS_COLUMNS.forEach(column => {
    const columnTasks = tasks.filter(task => task.status === column.key);
    const columnEl = document.createElement("section");
    columnEl.className = "board-column";
    columnEl.dataset.status = column.key;

    const header = document.createElement("div");
    header.className = "column-header";
    const label = document.createElement("h3");
    label.textContent = column.label;
    const count = document.createElement("span");
    count.className = "column-count";
    count.textContent = String(columnTasks.length);
    header.append(label, count);

    const body = document.createElement("div");
    body.className = "column-body";

    if (!columnTasks.length) {
      const empty = document.createElement("div");
      empty.className = "empty-column";
      empty.textContent = "No tasks here yet.";
      body.appendChild(empty);
    } else {
      columnTasks.forEach(task => body.appendChild(createTaskCard(task)));
    }

    columnEl.append(header, body);
    board.appendChild(columnEl);
  });
}

async function loadUser() {
  try {
    const response = await fetch("/api/users/current");
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const profile = await response.json();
    renderUserProfile(profile);
  } catch (error) {
    renderUserProfile({ name: "User", role: "Team Member", imageUrl: "" });
    document.querySelector("#user-role").textContent = "Profile unavailable";
  }
}

async function loadTasks() {
  const status = document.querySelector("#task-status");
  const refreshButton = document.querySelector("#refresh-tasks");
  if (!state.taskLoadError) status.textContent = "Loading tasks...";
  refreshButton.disabled = true;

  try {
    const response = await fetch("/api/tasks");
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const tasks = await response.json();
    if (!Array.isArray(tasks)) throw new Error("The task response was invalid.");
    state.taskLoadError = "";
    state.tasks = tasks;
    const visibleTasks = getVisibleTasks();
    renderSummary(state.tasks);
    renderBoard(visibleTasks);
    status.textContent = state.tasks.length === 0
      ? "No tasks available."
      : visibleTasks.length === 0
        ? "No tasks match the current search and filters."
        : "";
  } catch (error) {
    state.tasks = [];
    state.taskLoadError = `Unable to load tasks. ${error.message} Use Refresh tasks to try again.`;
    renderSummary([]);
    renderBoard([]);
    status.textContent = state.taskLoadError;
  } finally {
    refreshButton.disabled = false;
  }
}

function updateFilters() {
  const visibleTasks = getVisibleTasks();
  renderSummary(state.tasks);
  renderBoard(visibleTasks);
  document.querySelector("#task-status").textContent = state.taskLoadError || (state.tasks.length === 0
    ? "No tasks available."
    : visibleTasks.length === 0
      ? "No tasks match the current search and filters."
      : "");
}

function bindControls() {
  document.querySelector("#task-search").addEventListener("input", event => {
    state.filters.query = event.target.value;
    updateFilters();
  });

  document.querySelector("#priority-filter").addEventListener("change", event => {
    state.filters.priority = event.target.value;
    updateFilters();
  });

  document.querySelector("#status-filter").addEventListener("change", event => {
    state.filters.status = event.target.value;
    updateFilters();
  });

  document.querySelector("#clear-filters").addEventListener("click", () => {
    state.filters = { query: "", priority: "ALL", status: "ALL" };
    document.querySelector("#task-search").value = "";
    document.querySelector("#priority-filter").value = "ALL";
    document.querySelector("#status-filter").value = "ALL";
    updateFilters();
  });

  document.querySelectorAll(".nav-item").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
      document.querySelectorAll(".nav-item").forEach(item => item.removeAttribute("aria-current"));
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    });
  });

  document.querySelector("#refresh-tasks").addEventListener("click", loadTasks);
}

bindControls();
loadUser();
loadTasks();
