const state = {
  tasks: [],
  filters: {
    search: "",
    status: "ALL",
    priority: "ALL",
  },
};

const columnOrder = [
  { key: "OPEN", label: "To Do", cssClass: "todo" },
  { key: "IN_PROGRESS", label: "In Progress", cssClass: "in-progress" },
  { key: "COMPLETED", label: "Completed", cssClass: "completed" },
  { key: "ON_HOLD", label: "On Hold", cssClass: "on-hold" },
];

const summaryEls = {
  total: document.getElementById("summaryTotal"),
  completed: document.getElementById("summaryCompleted"),
  inProgress: document.getElementById("summaryInProgress"),
  todo: document.getElementById("summaryTodo"),
};

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const reloadButton = document.getElementById("reload");
const clearButton = document.getElementById("clearFilters");
const globalSearch = document.getElementById("globalSearch");
const taskSearch = document.getElementById("taskSearch");
const priorityFilter = document.getElementById("priorityFilter");
const statusFilter = document.getElementById("statusFilter");

function normaliseStatus(status) {
  if (!status) return "OPEN";
  const cleaned = String(status).trim().toUpperCase();
  if (cleaned === "IN_PROGRESS") return "IN_PROGRESS";
  if (cleaned === "COMPLETED") return "COMPLETED";
  if (cleaned === "ON_HOLD") return "ON_HOLD";
  return "OPEN";
}

function getInitials(name) {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "U";
}

function safeText(value, fallback = "") {
  return value == null || String(value).trim() === "" ? fallback : String(value).trim();
}

function renderUserProfile(profile) {
  const name = safeText(profile?.name, "User");
  const role = safeText(profile?.role, "Team member");
  const imageUrl = safeText(profile?.imageUrl, "");

  const profileName = document.getElementById("profileName");
  const profileRole = document.getElementById("profileRole");
  const profileAvatar = document.getElementById("profileAvatar");
  const welcomeName = document.getElementById("welcomeName");

  profileName.textContent = name;
  profileRole.textContent = role;
  profileAvatar.textContent = getInitials(name);
  profileAvatar.style.background = imageUrl ? "" : "linear-gradient(135deg, #cfead9, #9ec3a8)";

  if (imageUrl) {
    profileAvatar.style.backgroundImage = `url("${imageUrl}")`;
    profileAvatar.style.backgroundSize = "cover";
    profileAvatar.style.backgroundPosition = "center";
    profileAvatar.textContent = "";
  } else {
    profileAvatar.style.backgroundImage = "none";
    profileAvatar.textContent = getInitials(name);
  }

  welcomeName.textContent = name ? `${name}!` : "Welcome!";
}

function renderSummary(tasks) {
  const completed = tasks.filter((task) => normaliseStatus(task.status) === "COMPLETED").length;
  const inProgress = tasks.filter((task) => normaliseStatus(task.status) === "IN_PROGRESS").length;
  const todo = tasks.filter((task) => normaliseStatus(task.status) === "OPEN").length;

  summaryEls.total.textContent = tasks.length;
  summaryEls.completed.textContent = completed;
  summaryEls.inProgress.textContent = inProgress;
  summaryEls.todo.textContent = todo;
}

function getFilteredTasks() {
  const search = state.filters.search.trim().toLowerCase();

  return state.tasks.filter((task) => {
    const matchesSearch = !search ||
      [task.title, task.description, task.status, task.priority]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));

    const matchesStatus = state.filters.status === "ALL" || normaliseStatus(task.status) === state.filters.status;
    const matchesPriority = state.filters.priority === "ALL" || String(task.priority).toUpperCase() === state.filters.priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });
}

function createPriorityBadge(priority) {
  const value = String(priority || "MEDIUM").toUpperCase();
  const badge = document.createElement("span");
  badge.className = `task-priority ${value.toLowerCase()}`;
  badge.textContent = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  return badge;
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";

  const badge = createPriorityBadge(task.priority);
  const title = document.createElement("h3");
  title.textContent = safeText(task.title, "Untitled task");

  const description = document.createElement("p");
  description.textContent = safeText(task.description, "No description available.");

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const label = document.createElement("span");
  label.className = "task-key";
  label.textContent = `#${safeText(task.id, "N/A")}`;

  meta.appendChild(label);
  meta.appendChild(badge);

  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(meta);
  return card;
}

function renderBoard() {
  const visibleTasks = getFilteredTasks();
  const tasksByColumn = Object.fromEntries(columnOrder.map((column) => [column.key, []]));

  for (const task of visibleTasks) {
    tasksByColumn[normaliseStatus(task.status)].push(task);
  }

  boardEl.replaceChildren();

  for (const column of columnOrder) {
    const tasks = tasksByColumn[column.key] || [];
    const columnEl = document.createElement("section");
    columnEl.className = `board-column ${column.cssClass}`;

    const header = document.createElement("div");
    header.className = "column-header";

    const title = document.createElement("h3");
    title.textContent = `${column.label} ${tasks.length}`;

    const count = document.createElement("span");
    count.className = "column-count";
    count.textContent = String(tasks.length);

    header.appendChild(title);
    header.appendChild(count);
    columnEl.appendChild(header);

    if (tasks.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-column";
      empty.textContent = "No tasks match this view.";
      columnEl.appendChild(empty);
    } else {
      for (const task of tasks) {
        columnEl.appendChild(createTaskCard(task));
      }
    }

    boardEl.appendChild(columnEl);
  }

  statusEl.textContent = visibleTasks.length === state.tasks.length
    ? `${state.tasks.length} tasks loaded`
    : `${visibleTasks.length} matching tasks`;
}

async function loadTasks() {
  statusEl.textContent = "Loading tasks…";
  try {
    const params = new URLSearchParams();
    if (state.filters.priority !== "ALL") {
      params.set("priority", state.filters.priority);
    }

    const url = params.size > 0 ? `/api/tasks?${params.toString()}` : "/api/tasks";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    state.tasks = await response.json();
    renderSummary(state.tasks);
    renderBoard();
  } catch (error) {
    statusEl.textContent = `Unable to load tasks: ${error.message}`;
  }
}

async function loadUser() {
  try {
    const response = await fetch("/api/users/current");
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    const profile = await response.json();
    renderUserProfile(profile);
  } catch (error) {
    renderUserProfile({ name: "Team Member", role: "Project member" });
  }
}

function syncSearchInputs() {
  globalSearch.value = state.filters.search;
  taskSearch.value = state.filters.search;
  priorityFilter.value = state.filters.priority;
  statusFilter.value = state.filters.status;
}

function applyFilterChanges() {
  state.filters.search = globalSearch.value.trim();
  taskSearch.value = state.filters.search;
  renderBoard();
}

reloadButton.addEventListener("click", () => {
  loadTasks();
});

clearButton.addEventListener("click", () => {
  state.filters = {
    search: "",
    status: "ALL",
    priority: "ALL",
  };
  syncSearchInputs();
  loadTasks();
});

globalSearch.addEventListener("input", () => {
  state.filters.search = globalSearch.value.trim();
  taskSearch.value = state.filters.search;
  renderBoard();
});

taskSearch.addEventListener("input", () => {
  state.filters.search = taskSearch.value.trim();
  globalSearch.value = state.filters.search;
  renderBoard();
});

priorityFilter.addEventListener("change", () => {
  state.filters.priority = priorityFilter.value;
  loadTasks();
});

statusFilter.addEventListener("change", () => {
  state.filters.status = statusFilter.value;
  renderBoard();
});

syncSearchInputs();
loadUser();
loadTasks();
