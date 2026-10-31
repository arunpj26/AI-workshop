const STATUS_LABELS = {
  OPEN: "To Do",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold"
};

const GENERIC_PROFILE = {
  name: "TaskFlow User",
  role: "Project Team",
  imageUrl: ""
};

const state = {
  tasks: [],
  profile: { ...GENERIC_PROFILE },
  profileError: "",
  tasksError: "",
  tasksLoading: true,
  hasLoadedTasks: false,
  search: "",
  priorityFilter: "ALL",
  statusFilter: "ALL"
};

const elements = {
  search: document.querySelector("#task-search"),
  profile: document.querySelector("#user-profile"),
  profileCount: document.querySelector("#profile-count"),
  welcomeName: document.querySelector("#welcome-name"),
  welcomeRole: document.querySelector("#welcome-role"),
  welcomeLabel: document.querySelector("#welcome-label"),
  summaryTotal: document.querySelector("#summary-total"),
  summaryCompleted: document.querySelector("#summary-completed"),
  summaryInProgress: document.querySelector("#summary-in-progress"),
  summaryToDo: document.querySelector("#summary-to-do"),
  boardColumns: document.querySelector("#board-columns"),
  statusMessage: document.querySelector("#status-message"),
  priorityFilter: document.querySelector("#priority-filter"),
  statusFilter: document.querySelector("#status-filter"),
  clearFilters: document.querySelector("#clear-filters"),
  refreshButton: document.querySelector("#refresh-data")
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function normalizeName(name) {
  const trimmed = typeof name === "string" ? name.trim() : "";
  return trimmed || GENERIC_PROFILE.name;
}

function normalizeRole(role) {
  const trimmed = typeof role === "string" ? role.trim() : "";
  return trimmed || GENERIC_PROFILE.role;
}

function getSafeImageUrl(imageUrl) {
  if (typeof imageUrl !== "string") return "";
  const trimmed = imageUrl.trim();
  try {
    const parsedUrl = new URL(trimmed, window.location.origin);
    const isWebUrl = /^https?:\/\//i.test(trimmed)
      && (parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:");
    const isSameOriginPath = trimmed.startsWith("/")
      && parsedUrl.origin === window.location.origin
      && (parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:");
    return isWebUrl || isSameOriginPath ? trimmed : "";
  } catch {
    return "";
  }
}

function getInitials(name) {
  const safeName = normalizeName(name);
  return safeName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "TF";
}

function setStatusMessage(message, severity = "info") {
  elements.statusMessage.textContent = message;
  elements.statusMessage.classList.toggle("error", severity === "error");
  elements.statusMessage.classList.toggle("warning", severity === "warning");
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Unexpected error";
}

function createAvatar(profile) {
  const wrapper = document.createElement("div");
  wrapper.className = "avatar";

  if (profile.imageUrl) {
    const img = document.createElement("img");
    img.src = profile.imageUrl;
    img.alt = `${normalizeName(profile.name)} profile image`;
    img.addEventListener("error", () => {
      wrapper.replaceChildren();
      const fallback = document.createElement("span");
      fallback.textContent = getInitials(profile.name);
      wrapper.appendChild(fallback);
    });
    wrapper.appendChild(img);
    return wrapper;
  }

  const fallback = document.createElement("span");
  fallback.textContent = getInitials(profile.name);
  wrapper.appendChild(fallback);
  return wrapper;
}

function renderProfile(profile) {
  const name = normalizeName(profile.name);
  const role = normalizeRole(profile.role);
  const greeting = getGreeting();

  elements.welcomeLabel.textContent = `${greeting},`;
  elements.welcomeName.textContent = name;
  elements.welcomeRole.textContent = role;

  const avatar = createAvatar(profile);
  const nameNode = document.createElement("div");
  nameNode.className = "profile-name";
  nameNode.textContent = name;

  const roleNode = document.createElement("div");
  roleNode.className = "profile-role";
  roleNode.textContent = role;

  elements.profile.replaceChildren(avatar, nameNode, roleNode);
  elements.profileCount.textContent = getInitials(name);
}

function getStatusDisplay(status) {
  if (isKnownStatus(status)) return STATUS_LABELS[status];
  return typeof status === "string" && status.trim()
    ? `Unsupported status: ${status.trim()}`
    : "Unknown status";
}

function isKnownStatus(status) {
  return Object.prototype.hasOwnProperty.call(STATUS_LABELS, status);
}

function getPriorityLabel(priority) {
  const normalized = typeof priority === "string" ? priority.trim().toUpperCase() : "";
  return ["LOW", "MEDIUM", "HIGH"].includes(normalized) ? normalized : "Priority unavailable";
}

function getPriorityClass(priority) {
  const normalized = typeof priority === "string" ? priority.trim().toUpperCase() : "";
  return ["LOW", "MEDIUM", "HIGH"].includes(normalized) ? normalized : "UNKNOWN";
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";

  const header = document.createElement("div");
  header.className = "task-card-header";

  const statusBadge = document.createElement("span");
  statusBadge.className = "status-badge";
  statusBadge.textContent = getStatusDisplay(task.status);

  const priorityBadge = document.createElement("span");
  priorityBadge.className = `priority-badge ${getPriorityClass(task.priority)}`;
  priorityBadge.textContent = getPriorityLabel(task.priority);

  header.appendChild(statusBadge);
  header.appendChild(priorityBadge);

  const title = document.createElement("h3");
  title.textContent = typeof task.title === "string" && task.title.trim()
    ? task.title
    : "Untitled task";

  const description = document.createElement("p");
  description.className = "task-description";
  description.textContent = typeof task.description === "string" && task.description.trim()
    ? task.description
    : "No description provided.";

  card.appendChild(header);
  card.appendChild(title);
  card.appendChild(description);

  if (task.id !== undefined && task.id !== null) {
    const taskId = document.createElement("div");
    taskId.className = "task-id";
    taskId.textContent = `#${String(task.id)}`;
    card.appendChild(taskId);
  }

  return card;
}

function renderBoard(tasks) {
  const columns = [
    { key: "To Do", status: "OPEN", label: "To Do" },
    { key: "In Progress", status: "IN_PROGRESS", label: "In Progress" },
    { key: "Completed", status: "COMPLETED", label: "Completed" },
    { key: "On Hold", status: "ON_HOLD", label: "On Hold" }
  ];

  const byColumn = new Map(columns.map((column) => [column.key, []]));
  for (const task of tasks) {
    const columnKey = getStatusDisplay(task.status);
    if (byColumn.has(columnKey)) {
      byColumn.get(columnKey).push(task);
    } else {
      byColumn.get("On Hold").push(task);
    }
  }

  elements.boardColumns.replaceChildren();

  columns.forEach((column, index) => {
    const columnElement = document.createElement("section");
    columnElement.className = "board-column";
    columnElement.dataset.column = column.key;
    columnElement.setAttribute("aria-labelledby", `column-heading-${index}`);

    const heading = document.createElement("div");
    heading.className = "column-header";

    const title = document.createElement("h3");
    title.id = `column-heading-${index}`;
    title.textContent = column.label;
    title.className = "column-title";

    const count = document.createElement("span");
    count.className = "column-count";
    count.textContent = byColumn.get(column.key).length;
    count.setAttribute("aria-label", `${byColumn.get(column.key).length} tasks`);

    heading.appendChild(title);
    heading.appendChild(count);

    const list = document.createElement("div");
    list.className = "task-list";

    const items = byColumn.get(column.key);
    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-column";
      empty.textContent = "No tasks";
      list.appendChild(empty);
    } else {
      items.forEach((task) => list.appendChild(createTaskCard(task)));
    }

    columnElement.appendChild(heading);
    columnElement.appendChild(list);
    elements.boardColumns.appendChild(columnElement);
  });
}

function renderSummary(tasks) {
  const counts = {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === "COMPLETED").length,
    inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
    toDo: tasks.filter((task) => task.status === "OPEN").length
  };

  elements.summaryTotal.textContent = counts.total;
  elements.summaryCompleted.textContent = counts.completed;
  elements.summaryInProgress.textContent = counts.inProgress;
  elements.summaryToDo.textContent = counts.toDo;
}

function getFilteredTasks() {
  const query = state.search.trim().toLowerCase();

  return state.tasks.filter((task) => {
    const searchableText = [task.id, task.title, task.description, task.status, task.priority]
      .filter((value) => value !== undefined && value !== null)
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query || searchableText.includes(query);
    const priority = typeof task.priority === "string" ? task.priority.toUpperCase() : "";
    const matchesPriority = state.priorityFilter === "ALL" || priority === state.priorityFilter;
    const matchesStatus = state.statusFilter === "ALL" || (isKnownStatus(task.status) && STATUS_LABELS[task.status] === state.statusFilter);
    return matchesQuery && matchesPriority && matchesStatus;
  });
}

function renderStatusMessage(visibleTasks) {
  const messages = [];
  let severity = "info";

  if (state.tasksError) {
    messages.push(state.tasksError);
    severity = "error";
  }
  if (state.profileError) {
    messages.push(state.profileError);
    severity = "error";
  }
  if (state.tasksLoading) messages.push("Loading tasks…");

  if (messages.length === 0) {
    if (state.tasks.length === 0) {
      messages.push("No tasks are available right now.");
    } else if (visibleTasks.length === 0) {
      messages.push("No tasks match the current search and filters.");
    } else {
      messages.push(`${visibleTasks.length} task${visibleTasks.length === 1 ? "" : "s"} visible`);
    }
  }

  const unsupportedCount = visibleTasks.filter((task) => !isKnownStatus(task.status)).length;
  if (unsupportedCount > 0) {
    messages.push(`${unsupportedCount} task${unsupportedCount === 1 ? " has" : "s have"} an unsupported status and appear under On Hold with the original status shown.`);
    if (severity === "info") severity = "warning";
  }

  setStatusMessage(messages.join(" "), severity);
}

function render() {
  const visibleTasks = getFilteredTasks();
  renderSummary(state.tasks);
  renderBoard(visibleTasks);
  renderStatusMessage(visibleTasks);
}

async function loadProfile() {
  try {
    const response = await fetch("/api/users/current");
    if (!response.ok) {
      throw new Error(`Profile request failed (${response.status})`);
    }

    const profile = await response.json();
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
      throw new Error("Profile response was not a JSON object.");
    }

    state.profile = {
      name: profile.name,
      role: profile.role,
      imageUrl: getSafeImageUrl(profile.imageUrl)
    };
    state.profileError = "";
  } catch (error) {
    state.profile = { ...GENERIC_PROFILE };
    state.profileError = `Profile unavailable; showing a generic profile: ${getErrorMessage(error)}`;
  }

  renderProfile(state.profile);
  renderStatusMessage(getFilteredTasks());
}

async function loadTasks() {
  state.tasksLoading = true;
  state.tasksError = "";
  elements.refreshButton.disabled = true;
  renderStatusMessage(getFilteredTasks());

  try {
    const response = await fetch("/api/tasks");
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    const tasks = await response.json();
    if (!Array.isArray(tasks) || !tasks.every((task) => task && typeof task === "object" && !Array.isArray(task))) {
      throw new Error("Task response was not an array of task objects.");
    }
    state.tasks = tasks;
    state.hasLoadedTasks = true;
  } catch (error) {
    const fallbackMessage = state.hasLoadedTasks
      ? " Showing the last successfully loaded results."
      : "";
    state.tasksError = `Unable to load tasks: ${getErrorMessage(error)}.${fallbackMessage}`;
  } finally {
    state.tasksLoading = false;
    elements.refreshButton.disabled = false;
    render();
  }
}

function bindEvents() {
  elements.search.addEventListener("input", (event) => {
    state.search = event.target.value;
    render();
  });

  elements.priorityFilter.addEventListener("change", (event) => {
    state.priorityFilter = event.target.value;
    render();
  });

  elements.statusFilter.addEventListener("change", (event) => {
    state.statusFilter = event.target.value;
    render();
  });

  elements.clearFilters.addEventListener("click", () => {
    state.search = "";
    state.priorityFilter = "ALL";
    state.statusFilter = "ALL";
    elements.search.value = "";
    elements.priorityFilter.value = "ALL";
    elements.statusFilter.value = "ALL";
    render();
  });

  elements.refreshButton.addEventListener("click", async () => {
    await Promise.all([loadProfile(), loadTasks()]);
  });
}

bindEvents();
Promise.all([loadProfile(), loadTasks()]);
