const columns = [
  { status: "OPEN", label: "To Do", style: "todo" },
  { status: "IN_PROGRESS", label: "In Progress", style: "progress" },
  { status: "COMPLETED", label: "Completed", style: "completed" },
  { status: "ON_HOLD", label: "On Hold", style: "hold" }
];

const elements = {
  board: document.querySelector("#board-columns"),
  clearFilters: document.querySelector("#clear-filters"),
  completedCount: document.querySelector("#completed-count"),
  greetingName: document.querySelector("#greeting-name"),
  initials: document.querySelector("#profile-initials"),
  profileImage: document.querySelector("#profile-image"),
  profileName: document.querySelector("#profile-name"),
  profileNotice: document.querySelector("#profile-notice"),
  profileRole: document.querySelector("#profile-role"),
  priorityFilter: document.querySelector("#priority-filter"),
  progressCount: document.querySelector("#progress-count"),
  reload: document.querySelector("#reload"),
  search: document.querySelector("#task-search"),
  status: document.querySelector("#task-status"),
  statusFilter: document.querySelector("#status-filter"),
  todoCount: document.querySelector("#todo-count"),
  totalCount: document.querySelector("#total-count")
};

let tasks = [];
let tasksFailed = false;

function valueAsText(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeTask(task) {
  return {
    id: valueAsText(String(task.id ?? ""), ""),
    title: valueAsText(task.title, "Untitled task"),
    description: valueAsText(task.description),
    status: valueAsText(task.status, "UNKNOWN").toUpperCase() || "UNKNOWN",
    priority: valueAsText(task.priority, "UNKNOWN").toUpperCase() || "UNKNOWN"
  };
}

function taskStatusLabel(status) {
  const known = columns.find((column) => column.status === status);
  if (known) return known.label;
  return status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function initialsFor(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "G";
  return parts.slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase();
}

function safeProfileImageUrl(value) {
  if (/^https?:\/\//i.test(value)) return value;
  if (!value.startsWith("/") || value.startsWith("//")) return "";

  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin ? value : "";
  } catch {
    return "";
  }
}

function renderProfile(profile) {
  const name = valueAsText(profile?.name);
  const role = valueAsText(profile?.role);
  const imageUrl = safeProfileImageUrl(valueAsText(profile?.imageUrl));

  elements.profileName.textContent = name || "Guest";
  elements.greetingName.textContent = name || "there";
  elements.profileRole.textContent = role;
  elements.profileRole.hidden = !role;
  elements.initials.textContent = initialsFor(name);
  elements.profileImage.hidden = true;
  elements.initials.hidden = false;
  elements.profileImage.onerror = null;

  if (imageUrl) {
    elements.profileImage.alt = name ? `${name} profile image` : "User profile image";
    elements.profileImage.onerror = () => {
      elements.profileImage.hidden = true;
      elements.initials.hidden = false;
    };
    elements.profileImage.src = imageUrl;
    elements.profileImage.hidden = false;
    elements.initials.hidden = true;
  }
}

function renderSummary() {
  const countForStatus = (status) => tasks.filter((task) => task.status === status).length;
  elements.totalCount.textContent = String(tasks.length);
  elements.todoCount.textContent = String(countForStatus("OPEN"));
  elements.progressCount.textContent = String(countForStatus("IN_PROGRESS"));
  elements.completedCount.textContent = String(countForStatus("COMPLETED"));
}

function createPriorityBadge(priority) {
  const badge = document.createElement("span");
  const supportedPriority = ["HIGH", "MEDIUM", "LOW"].includes(priority) ? priority.toLowerCase() : "unknown";
  badge.className = `priority-badge priority-${supportedPriority}`;
  badge.textContent = priority === "UNKNOWN" ? "Priority not set" : priority.charAt(0) + priority.slice(1).toLowerCase();
  return badge;
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";

  const badge = createPriorityBadge(task.priority);
  const title = document.createElement("h4");
  title.textContent = task.title;
  card.append(badge, title);

  if (task.description) {
    const description = document.createElement("p");
    description.className = "task-description";
    description.textContent = task.description;
    card.appendChild(description);
  }

  const metadata = document.createElement("div");
  metadata.className = "task-metadata";
  const taskId = document.createElement("span");
  taskId.textContent = task.id ? `Task #${task.id}` : "Task";
  metadata.appendChild(taskId);

  if (!columns.some((column) => column.status === task.status)) {
    const status = document.createElement("span");
    status.textContent = taskStatusLabel(task.status);
    metadata.appendChild(status);
  }
  card.appendChild(metadata);
  return card;
}

function createColumn(column, columnTasks) {
  const section = document.createElement("section");
  section.className = `board-column column-${column.style}`;
  section.setAttribute("aria-labelledby", `column-${column.style}-title`);

  const heading = document.createElement("div");
  heading.className = "column-heading";
  const titleGroup = document.createElement("div");
  titleGroup.className = "column-title-group";
  const indicator = document.createElement("span");
  indicator.className = "column-indicator";
  indicator.setAttribute("aria-hidden", "true");
  const title = document.createElement("h3");
  title.id = `column-${column.style}-title`;
  title.textContent = column.label;
  const count = document.createElement("span");
  count.className = "column-count";
  count.textContent = String(columnTasks.length);
  titleGroup.append(indicator, title, count);
  heading.appendChild(titleGroup);
  section.appendChild(heading);

  const cardList = document.createElement("div");
  cardList.className = "column-cards";
  if (columnTasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "column-empty";
    empty.textContent = "No tasks here.";
    cardList.appendChild(empty);
  } else {
    columnTasks.forEach((task) => cardList.appendChild(createTaskCard(task)));
  }
  section.appendChild(cardList);
  return section;
}

function visibleTasks() {
  const query = elements.search.value.trim().toLowerCase();
  const selectedPriority = elements.priorityFilter.value;
  const selectedStatus = elements.statusFilter.value;

  return tasks.filter((task) => {
    const searchableText = `${task.title} ${task.description} ${task.id} ${task.status} ${task.priority}`.toLowerCase();
    const matchesSearch = !query || searchableText.includes(query);
    const matchesPriority = selectedPriority === "ALL" || task.priority === selectedPriority;
    const matchesStatus = selectedStatus === "ALL" || task.status === selectedStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });
}

function renderBoard() {
  const filteredTasks = visibleTasks();
  const knownColumns = columns.map((column) => ({
    ...column,
    tasks: filteredTasks.filter((task) => task.status === column.status)
  }));
  const unknownStatuses = [...new Set(filteredTasks.map((task) => task.status))]
    .filter((status) => !columns.some((column) => column.status === status));

  unknownStatuses.forEach((status, index) => {
    knownColumns.push({
      status,
      label: taskStatusLabel(status),
      style: `other-${index}`,
      tasks: filteredTasks.filter((task) => task.status === status)
    });
  });

  elements.board.replaceChildren(...knownColumns.map((column) => createColumn(column, column.tasks)));

  if (tasksFailed) return;
  if (tasks.length === 0) {
    elements.status.textContent = "No tasks yet. Use Refresh to check again.";
  } else if (filteredTasks.length === 0) {
    elements.status.textContent = "No tasks match the current search and filters.";
  } else {
    elements.status.textContent = `Showing ${filteredTasks.length} of ${tasks.length} tasks.`;
  }
}

function updateStatusFilterOptions() {
  const selected = elements.statusFilter.value;
  const knownStatuses = new Set(columns.map((column) => column.status));
  const unknownStatuses = [...new Set(tasks.map((task) => task.status))]
    .filter((status) => !knownStatuses.has(status));

  elements.statusFilter.replaceChildren(new Option("All statuses", "ALL"));
  columns.forEach((column) => elements.statusFilter.add(new Option(column.label, column.status)));
  unknownStatuses.forEach((status) => elements.statusFilter.add(new Option(taskStatusLabel(status), status)));
  elements.statusFilter.value = [...elements.statusFilter.options].some((option) => option.value === selected)
    ? selected
    : "ALL";
}

async function loadDashboard() {
  elements.reload.disabled = true;
  elements.status.textContent = "Loading tasks...";
  elements.profileNotice.hidden = true;

  const [tasksResult, profileResult] = await Promise.allSettled([
    fetch("/api/tasks").then(async (response) => {
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const payload = await response.json();
      if (!Array.isArray(payload)) throw new Error("The task response was not a list.");
      return payload.filter((task) => task && typeof task === "object").map(normalizeTask);
    }),
    fetch("/api/users/current").then(async (response) => {
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      return response.json();
    })
  ]);

  if (tasksResult.status === "fulfilled") {
    tasks = tasksResult.value;
    tasksFailed = false;
    renderSummary();
    updateStatusFilterOptions();
    renderBoard();
  } else {
    tasks = [];
    tasksFailed = true;
    renderSummary();
    renderBoard();
    elements.status.textContent = `Unable to load tasks: ${tasksResult.reason.message || "Request failed."}`;
  }

  if (profileResult.status === "fulfilled") {
    renderProfile(profileResult.value);
  } else {
    renderProfile(null);
    elements.profileNotice.textContent = "Profile unavailable. Showing a generic profile.";
    elements.profileNotice.hidden = false;
  }

  elements.reload.disabled = false;
}

elements.search.addEventListener("input", renderBoard);
elements.priorityFilter.addEventListener("change", renderBoard);
elements.statusFilter.addEventListener("change", renderBoard);
elements.clearFilters.addEventListener("click", () => {
  elements.search.value = "";
  elements.priorityFilter.value = "ALL";
  elements.statusFilter.value = "ALL";
  renderBoard();
});
elements.reload.addEventListener("click", loadDashboard);

renderProfile(null);
renderSummary();
renderBoard();
loadDashboard();
