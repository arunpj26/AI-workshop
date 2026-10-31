const columnMap = {
  "To Do": "tasks-todo",
  "In Progress": "tasks-in-progress",
  "Completed": "tasks-completed",
  "On Hold": "tasks-on-hold"
};

const priorityLabels = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low"
};

const state = {
  tasks: [],
  user: null,
  filters: {
    search: "",
    priority: "all",
    status: "all"
  }
};

function normalizeText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function getInitials(name) {
  const safeName = normalizeText(name, "UVJ");
  const parts = safeName.split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "UV";
  return parts.map((part) => part[0].toUpperCase()).join("").slice(0, 2);
}

function mapTaskStatus(status) {
  const normalized = normalizeText(status, "").toUpperCase();

  if (normalized === "OPEN" || normalized === "TO_DO") return "To Do";
  if (normalized === "IN_PROGRESS") return "In Progress";
  if (normalized === "COMPLETED") return "Completed";
  if (normalized === "ON_HOLD") return "On Hold";
  return "To Do";
}

function getSummaryCounts(tasks) {
  return {
    total: tasks.length,
    completed: tasks.filter((task) => mapTaskStatus(task.status) === "Completed").length,
    inProgress: tasks.filter((task) => mapTaskStatus(task.status) === "In Progress").length,
    todo: tasks.filter((task) => mapTaskStatus(task.status) === "To Do").length
  };
}

function updateUserProfile(profile) {
  const name = normalizeText(profile?.name);
  const role = normalizeText(profile?.role);
  const avatar = document.querySelector("#user-avatar");
  const nameNode = document.querySelector("#user-name");
  const roleNode = document.querySelector("#user-role");
  const welcomeHeading = document.querySelector("#welcome-heading");

  nameNode.textContent = name || "Current user";
  roleNode.textContent = role;
  roleNode.hidden = !role;
  welcomeHeading.textContent = name ? `Welcome back, ${name}` : "Welcome to UVJTaskFlow";
  avatar.setAttribute("aria-label", name ? `${name} profile image` : "Current user profile image");
  avatar.replaceChildren();

  const showInitials = () => {
    const initials = document.createElement("span");
    initials.textContent = name ? getInitials(name) : "UV";
    initials.setAttribute("aria-hidden", "true");
    avatar.replaceChildren(initials);
  };

  if (normalizeText(profile?.imageUrl)) {
    const image = document.createElement("img");
    image.src = profile.imageUrl;
    image.alt = "";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", showInitials, { once: true });
    avatar.appendChild(image);
    return;
  }

  showInitials();
}

function renderSummary(tasks) {
  const counts = getSummaryCounts(tasks);
  document.querySelector("#total-tasks").textContent = String(counts.total);
  document.querySelector("#completed-tasks").textContent = String(counts.completed);
  document.querySelector("#in-progress-tasks").textContent = String(counts.inProgress);
  document.querySelector("#todo-tasks").textContent = String(counts.todo);

  const columnCounts = {
    "To Do": tasks.filter((task) => mapTaskStatus(task.status) === "To Do").length,
    "In Progress": tasks.filter((task) => mapTaskStatus(task.status) === "In Progress").length,
    "Completed": tasks.filter((task) => mapTaskStatus(task.status) === "Completed").length,
    "On Hold": tasks.filter((task) => mapTaskStatus(task.status) === "On Hold").length
  };

  for (const [columnName, countId] of Object.entries({
    "To Do": "count-todo",
    "In Progress": "count-in-progress",
    "Completed": "count-completed",
    "On Hold": "count-on-hold"
  })) {
    const countNode = document.querySelector(`#${countId}`);
    if (countNode) {
      countNode.textContent = String(columnCounts[columnName] || 0);
    }
  }
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";

  const title = document.createElement("h4");
  title.textContent = normalizeText(task.title, "Untitled task");

  const description = document.createElement("p");
  description.className = "task-description";
  description.textContent = normalizeText(task.description, "No description provided.");

  const metaRow = document.createElement("div");
  metaRow.className = "task-meta";

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = mapTaskStatus(task.status);

  const priority = document.createElement("span");
  priority.className = `task-priority priority-${normalizeText(task.priority, "MEDIUM").toUpperCase()}`;
  priority.textContent = priorityLabels[normalizeText(task.priority, "MEDIUM").toUpperCase()] || "Medium";

  metaRow.append(status, priority);

  const footer = document.createElement("div");
  footer.className = "task-footer";

  const badge = document.createElement("span");
  badge.className = "task-id";
  badge.textContent = `#${task.id ?? "—"}`;

  footer.appendChild(badge);
  card.append(title, description, metaRow, footer);

  return card;
}

function renderBoard(tasks) {
  const boardMessage = document.querySelector("#board-message");
  boardMessage.hidden = true;
  boardMessage.textContent = "";

  for (const columnName of Object.keys(columnMap)) {
    const list = document.querySelector(`#${columnMap[columnName]}`);
    list.replaceChildren();
  }

  const visibleTasks = tasks.filter((task) => {
    const taskStatus = mapTaskStatus(task.status);
    const matchesSearch = !state.filters.search ||
      `${task.title ?? ""} ${task.description ?? ""}`.toLowerCase().includes(state.filters.search.toLowerCase());
    const matchesPriority = state.filters.priority === "all" || normalizeText(task.priority, "MEDIUM").toUpperCase() === state.filters.priority;
    const matchesStatus = state.filters.status === "all" || taskStatus === state.filters.status;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  if (!tasks.length) {
    boardMessage.textContent = "No tasks are available yet.";
    boardMessage.hidden = false;
  } else if (!visibleTasks.length) {
    boardMessage.textContent = "No tasks match the current search and filters.";
    boardMessage.hidden = false;
  }

  const grouped = {
    "To Do": [],
    "In Progress": [],
    "Completed": [],
    "On Hold": []
  };

  for (const task of visibleTasks) {
    grouped[mapTaskStatus(task.status)]?.push(task);
  }

  for (const columnName of Object.keys(grouped)) {
    const container = document.querySelector(`#${columnMap[columnName]}`);
    if (!container) continue;

    if (!grouped[columnName].length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No tasks in this lane.";
      container.appendChild(empty);
      continue;
    }

    for (const task of grouped[columnName]) {
      container.appendChild(createTaskCard(task));
    }
  }
}

async function loadData() {
  const pageStatus = document.querySelector("#page-status");
  const boardMessage = document.querySelector("#board-message");
  const refreshButton = document.querySelector("#refresh-data");
  pageStatus.classList.remove("status-error");
  pageStatus.textContent = "Loading dashboard…";
  refreshButton.disabled = true;

  const requestJson = async (url, label) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${label} request failed (${response.status})`);
    return response.json();
  };

  const [profileResult, tasksResult] = await Promise.allSettled([
    requestJson("/api/users/current", "Profile"),
    requestJson("/api/tasks", "Tasks")
  ]);

  const messages = [];
  if (profileResult.status === "fulfilled") {
    state.user = profileResult.value;
    updateUserProfile(profileResult.value);
  } else {
    state.user = null;
    updateUserProfile(null);
    messages.push("Profile details are unavailable.");
  }

  if (tasksResult.status === "fulfilled" && Array.isArray(tasksResult.value)) {
    state.tasks = tasksResult.value;
    renderSummary(state.tasks);
    renderBoard(state.tasks);
  } else {
    messages.push("Tasks could not be loaded. Use Refresh to try again.");
    boardMessage.textContent = "Tasks could not be loaded. Use Refresh to try again.";
    boardMessage.hidden = false;
  }

  if (messages.length) {
    pageStatus.classList.add("status-error");
    pageStatus.textContent = messages.join(" ");
  } else {
    pageStatus.textContent = `${state.tasks.length} tasks loaded`;
  }

  refreshButton.disabled = false;
}

function bindEvents() {
  document.querySelector("#global-search").addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    renderBoard(state.tasks);
  });

  document.querySelector("#priority-filter").addEventListener("change", (event) => {
    state.filters.priority = event.target.value;
    renderBoard(state.tasks);
  });

  document.querySelector("#status-filter").addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    renderBoard(state.tasks);
  });

  document.querySelector("#clear-filters").addEventListener("click", () => {
    state.filters.search = "";
    state.filters.priority = "all";
    state.filters.status = "all";
    document.querySelector("#global-search").value = "";
    document.querySelector("#priority-filter").value = "all";
    document.querySelector("#status-filter").value = "all";
    renderBoard(state.tasks);
  });

  document.querySelector("#refresh-data").addEventListener("click", loadData);
}

bindEvents();
loadData();
