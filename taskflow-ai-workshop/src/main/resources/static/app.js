const statusMessage = document.querySelector("#status");
const profileName = document.querySelector("#profile-name");
const profileRole = document.querySelector("#profile-role");
const profileAvatar = document.querySelector("#profile-avatar");
const searchInput = document.querySelector("#task-search");
const priorityFilter = document.querySelector("#priority-filter");
const statusFilter = document.querySelector("#status-filter");
const boardView = document.querySelector("#board-view");
const listView = document.querySelector("#list-view");

const columns = [
  { key: "OPEN", tasks: "#todo-tasks", count: "#todo-column-count", empty: "#todo-empty" },
  { key: "IN_PROGRESS", tasks: "#progress-tasks", count: "#progress-column-count", empty: "#progress-empty" },
  { key: "COMPLETED", tasks: "#completed-tasks", count: "#completed-column-count", empty: "#completed-empty" },
  { key: "ON_HOLD", tasks: "#on-hold-tasks", count: "#on-hold-column-count", empty: "#on-hold-empty" }
];

let allTasks = [];
let currentTasks = [];

function isTaskList(value) {
  return Array.isArray(value) && value.every(task => task && typeof task === "object");
}

function initialsFor(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  return words.slice(0, 2).map(word => Array.from(word)[0].toLocaleUpperCase()).join("");
}

function renderProfile(profile) {
  const name = typeof profile?.name === "string" ? profile.name.trim() : "";
  const role = typeof profile?.role === "string" ? profile.role.trim() : "";
  const welcomeTitle = document.querySelector("#welcome-title");

  profileName.textContent = name || "Current user";
  profileRole.textContent = role;
  document.querySelector("#welcome-label").textContent = name ? "Welcome back," : "YOUR WORKSPACE";
  welcomeTitle.textContent = name ? `${name}!` : "Your work, clearly in flow.";
  profileAvatar.replaceChildren();
  profileAvatar.textContent = initialsFor(name);

  const imageUrl = typeof profile?.imageUrl === "string" ? profile.imageUrl.trim() : "";
  if (!imageUrl) return;

  let parsedUrl;
  try {
    parsedUrl = new URL(imageUrl, window.location.origin);
  } catch {
    return;
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password) return;

  const image = document.createElement("img");
  image.src = parsedUrl.href;
  image.alt = "";
  image.referrerPolicy = "no-referrer";
  image.addEventListener("error", () => {
    profileAvatar.replaceChildren();
    profileAvatar.textContent = initialsFor(name);
  }, { once: true });
  profileAvatar.replaceChildren(image);
}

async function loadProfile() {
  try {
    const response = await fetch("/api/users/current");
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const profile = await response.json();
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
      throw new Error("The profile response was invalid.");
    }
    renderProfile(profile);
    profileRole.removeAttribute("data-error");
  } catch (error) {
    profileName.textContent = "Profile unavailable";
    profileRole.textContent = error.message;
    profileRole.dataset.error = "true";
    document.querySelector("#welcome-label").textContent = "YOUR WORKSPACE";
    document.querySelector("#welcome-title").textContent = "Your work, clearly in flow.";
    profileAvatar.replaceChildren();
    profileAvatar.textContent = "U";
  }
}

function statusKey(task) {
  return typeof task.status === "string" ? task.status.trim().toUpperCase() : "";
}

function priorityLabel(priority) {
  const normalized = typeof priority === "string" ? priority.trim().toUpperCase() : "";
  return normalized ? normalized.charAt(0) + normalized.slice(1).toLowerCase() : "Unspecified";
}

function statusLabel(status) {
  return ({
    OPEN: "To Do",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    ON_HOLD: "On Hold"
  })[status] || (status ? status.replaceAll("_", " ").toLowerCase() : "Unspecified");
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";

  const priority = document.createElement("span");
  const priorityKey = typeof task.priority === "string" ? task.priority.trim().toUpperCase() : "";
  priority.className = `priority-badge${["LOW", "MEDIUM", "HIGH"].includes(priorityKey) ? ` ${priorityKey}` : ""}`;
  priority.textContent = priorityLabel(priorityKey);

  const title = document.createElement("h4");
  title.textContent = typeof task.title === "string" && task.title.trim() ? task.title : "Untitled task";

  const description = document.createElement("p");
  description.className = "task-description";
  description.textContent = typeof task.description === "string" && task.description.trim()
    ? task.description
    : "No description provided.";

  const meta = document.createElement("p");
  meta.className = "task-meta";
  meta.textContent = `Task #${String(task.id ?? "—")} · ${statusLabel(statusKey(task))}`;
  card.append(priority, title, description, meta);
  return card;
}

function filteredTasks() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const selectedStatus = statusFilter.value;
  return currentTasks.filter(task => {
    const matchesStatus = !selectedStatus || statusKey(task) === selectedStatus;
    const haystack = [task.title, task.description, task.priority, task.status, task.id]
      .filter(value => value !== null && value !== undefined)
      .join(" ")
      .toLocaleLowerCase();
    return matchesStatus && (!query || haystack.includes(query));
  });
}

function updateSummary() {
  const count = key => allTasks.filter(task => statusKey(task) === key).length;
  document.querySelector("#total-count").textContent = String(allTasks.length);
  document.querySelector("#completed-count").textContent = String(count("COMPLETED"));
  document.querySelector("#progress-count").textContent = String(count("IN_PROGRESS"));
  document.querySelector("#todo-count").textContent = String(count("OPEN"));
}

function renderTasks() {
  const tasks = filteredTasks();
  const knownStatuses = new Set(columns.map(column => column.key));
  const unknownCount = tasks.filter(task => !knownStatuses.has(statusKey(task))).length;
  statusMessage.classList.remove("is-error");

  for (const column of columns) {
    const columnTasks = tasks.filter(task => statusKey(task) === column.key);
    const taskStack = document.querySelector(column.tasks);
    taskStack.replaceChildren(...columnTasks.map(createTaskCard));
    document.querySelector(column.count).textContent = String(columnTasks.length);
    document.querySelector(column.empty).hidden = columnTasks.length > 0;
  }

  const listBody = document.querySelector("#task-list");
  listBody.replaceChildren();
  for (const task of tasks) {
    const row = document.createElement("tr");
    const values = [
      typeof task.title === "string" && task.title.trim() ? task.title : "Untitled task",
      typeof task.description === "string" && task.description.trim() ? task.description : "No description provided.",
      statusLabel(statusKey(task)),
      priorityLabel(task.priority)
    ];
    for (const value of values) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    }
    listBody.appendChild(row);
  }
  if (tasks.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = allTasks.length === 0 ? "No tasks are available yet." : "No tasks match your current search and filters.";
    row.appendChild(cell);
    listBody.appendChild(row);
  }

  if (unknownCount > 0) {
    statusMessage.textContent = `${tasks.length - unknownCount} tasks shown · ${unknownCount} tasks have an unsupported status and are not assigned to a column.`;
  } else if (tasks.length === 0) {
    statusMessage.textContent = allTasks.length === 0 ? "No tasks available." : "No tasks match your current search and filters.";
  } else {
    statusMessage.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} shown`;
  }
}

async function fetchTasks(priority) {
  const url = priority ? `/api/tasks?priority=${encodeURIComponent(priority)}` : "/api/tasks";
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  const tasks = await response.json();
  if (!isTaskList(tasks)) throw new Error("The task response was invalid.");
  return tasks;
}

async function loadTasks() {
  statusMessage.textContent = "Loading tasks…";
  statusMessage.classList.remove("is-error");
  try {
    const selectedPriority = priorityFilter.value;
    const [all, visible] = selectedPriority
      ? await Promise.all([fetchTasks(""), fetchTasks(selectedPriority)])
      : [await fetchTasks(""), null];
    allTasks = all;
    currentTasks = visible || all;
    updateSummary();
    renderTasks();
  } catch (error) {
    statusMessage.textContent = `Unable to load tasks: ${error.message}`;
    statusMessage.classList.add("is-error");
  }
}

function setView(view) {
  const isBoard = view === "board";
  boardView.hidden = !isBoard;
  listView.hidden = isBoard;
  document.querySelector("#board-view-button").classList.toggle("is-selected", isBoard);
  document.querySelector("#board-view-button").setAttribute("aria-pressed", String(isBoard));
  document.querySelector("#list-view-button").classList.toggle("is-selected", !isBoard);
  document.querySelector("#list-view-button").setAttribute("aria-pressed", String(!isBoard));
}

document.querySelector("#reload").addEventListener("click", () => {
  loadProfile();
  loadTasks();
});
document.querySelector("#priority-filter").addEventListener("change", loadTasks);
document.querySelector("#status-filter").addEventListener("change", renderTasks);
document.querySelector("#task-search").addEventListener("input", renderTasks);
document.querySelector("#clear-filters").addEventListener("click", () => {
  searchInput.value = "";
  priorityFilter.value = "";
  statusFilter.value = "";
  loadTasks();
});
document.querySelector("#board-view-button").addEventListener("click", () => setView("board"));
document.querySelector("#list-view-button").addEventListener("click", () => setView("list"));
for (const link of document.querySelectorAll(".nav-link")) {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(navLink => {
      navLink.classList.remove("is-active");
      navLink.removeAttribute("aria-current");
    });
    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");
  });
}

loadProfile();
loadTasks();
