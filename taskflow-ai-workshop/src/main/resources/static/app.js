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
  const name = normalizeText(profile?.name, "there");
  const role = normalizeText(profile?.role, "Project Member");
  const avatar = document.querySelector("#user-avatar");
  const nameNode = document.querySelector("#user-name");
  const roleNode = document.querySelector("#user-role");

  nameNode.textContent = name;
  roleNode.textContent = role;
  avatar.setAttribute("aria-label", `${name} profile`);
  avatar.replaceChildren();

  if (profile?.imageUrl) {
    const image = document.createElement("img");
    image.src = profile.imageUrl;
    image.alt = `${name} profile image`;
    image.referrerPolicy = "no-referrer";
    avatar.appendChild(image);
    return;
  }

  const initials = document.createElement("span");
  initials.textContent = getInitials(name);
  initials.setAttribute("aria-hidden", "true");
  avatar.appendChild(initials);
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
      empty.textContent = "No tasks match this lane.";
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
  pageStatus.textContent = "Loading data…";

  try {
    const [profile, tasks] = await Promise.all([
      fetch("/api/users/current").then((response) => {
        if (!response.ok) throw new Error(`Profile request failed (${response.status})`);
        return response.json();
      }),
      fetch("/api/tasks").then((response) => {
        if (!response.ok) throw new Error(`Tasks request failed (${response.status})`);
        return response.json();
      })
    ]);

    state.user = profile;
    state.tasks = tasks;
    updateUserProfile(profile);
    renderSummary(tasks);
    renderBoard(tasks);
    pageStatus.textContent = `${tasks.length} tasks loaded`;
  } catch (error) {
    pageStatus.textContent = `Unable to load dashboard: ${error.message}`;
  }
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

