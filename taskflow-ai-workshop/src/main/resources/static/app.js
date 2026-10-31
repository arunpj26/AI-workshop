const columns = [
  { key: "OPEN", label: "To Do", color: "todo" },
  { key: "IN_PROGRESS", label: "In Progress", color: "progress" },
  { key: "COMPLETED", label: "Completed", color: "completed" },
  { key: "ON_HOLD", label: "On Hold", color: "hold" }
];

let tasks = [];

const statusMessage = document.querySelector("#status");
const globalSearch = document.querySelector("#global-search");
const taskSearch = document.querySelector("#task-search");
const priorityFilter = document.querySelector("#priority-filter");
const statusFilter = document.querySelector("#status-filter");

function text(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function initials(name) {
  const parts = text(name).split(/\s+/).filter(Boolean);
  if (!parts.length) return "UV";
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

async function loadProfile() {
  try {
    const response = await fetch("/api/users/current");
    if (!response.ok) throw new Error(`Profile request failed (${response.status})`);
    const profile = await response.json();
    const name = text(profile.name);
    const role = text(profile.role);
    const imageUrl = text(profile.imageUrl);

    document.querySelector("#user-name").textContent = name || "UVJ team";
    document.querySelector("#user-role").textContent = role || "TaskFlow user";
    document.querySelector("#welcome-name").textContent = name ? `${name}!` : "UVJ team!";

    const avatar = document.querySelector("#user-avatar");
    avatar.replaceChildren();
    if (imageUrl) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = "";
      image.addEventListener("error", () => {
        avatar.replaceChildren(document.createTextNode(initials(name)));
      });
      avatar.appendChild(image);
    } else {
      avatar.textContent = initials(name);
    }
  } catch (error) {
    document.querySelector("#user-name").textContent = "UVJ team";
    document.querySelector("#user-role").textContent = "Profile unavailable";
    document.querySelector("#welcome-name").textContent = "UVJ team!";
  }
}

function normalizedStatus(status) {
  return text(status).toUpperCase().replace(/[ -]/g, "_");
}

function filteredTasks() {
  const search = text(globalSearch.value || taskSearch.value).toLowerCase();
  const priority = priorityFilter.value;
  const status = statusFilter.value;
  return tasks.filter((task) => {
    const searchable = [task.title, task.description, task.status, task.priority].map((value) => text(value).toLowerCase()).join(" ");
    return (!search || searchable.includes(search))
      && (!priority || normalizedStatus(task.priority) === priority)
      && (!status || normalizedStatus(task.status) === status);
  });
}

function updateSummary() {
  document.querySelector("#total-count").textContent = tasks.length;
  document.querySelector("#completed-count").textContent = tasks.filter((task) => normalizedStatus(task.status) === "COMPLETED").length;
  document.querySelector("#progress-count").textContent = tasks.filter((task) => normalizedStatus(task.status) === "IN_PROGRESS").length;
  document.querySelector("#todo-count").textContent = tasks.filter((task) => normalizedStatus(task.status) === "OPEN").length;
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";

  const priority = document.createElement("span");
  priority.className = `priority ${normalizedStatus(task.priority).toLowerCase()}`;
  priority.textContent = text(task.priority) || "No priority";
  card.appendChild(priority);

  const title = document.createElement("h3");
  title.textContent = text(task.title) || "Untitled task";
  card.appendChild(title);

  if (text(task.description)) {
    const description = document.createElement("p");
    description.textContent = text(task.description);
    card.appendChild(description);
  }

  const status = document.createElement("small");
  status.className = "task-status";
  status.textContent = normalizedStatus(task.status) || "Unknown status";
  card.appendChild(status);
  return card;
}

function renderBoard() {
  const visibleTasks = filteredTasks();
  const kanban = document.querySelector("#kanban");
  kanban.replaceChildren();
  const supportedStatuses = new Set(columns.map((column) => column.key));
  const unknownStatuses = [...new Set(visibleTasks.map((task) => normalizedStatus(task.status)).filter((status) => status && !supportedStatuses.has(status)))];
  const boardColumns = [...columns];

  if (unknownStatuses.length) {
    boardColumns.push(...unknownStatuses.map((status) => ({ key: status, label: status.replaceAll("_", " "), color: "hold" })));
  }

  for (const column of boardColumns) {
    if (column.key === "ON_HOLD" && !tasks.some((task) => normalizedStatus(task.status) === "ON_HOLD") && !visibleTasks.some((task) => normalizedStatus(task.status) === "ON_HOLD")) continue;
    const columnElement = document.createElement("section");
    columnElement.className = "kanban-column";
    const columnTasks = visibleTasks.filter((task) => normalizedStatus(task.status) === column.key);
    const heading = document.createElement("header");
    const dot = document.createElement("span");
    dot.className = `column-dot ${column.color}`;
    dot.setAttribute("aria-hidden", "true");
    const title = document.createElement("strong");
    title.textContent = column.label;
    const count = document.createElement("span");
    count.className = "column-count";
    count.textContent = columnTasks.length;
    heading.append(dot, title, count);
    columnElement.appendChild(heading);

    if (!columnTasks.length) {
      const empty = document.createElement("p");
      empty.className = "empty-column";
      empty.textContent = "No matching tasks";
      columnElement.appendChild(empty);
    } else {
      columnTasks.forEach((task) => columnElement.appendChild(createTaskCard(task)));
    }
    kanban.appendChild(columnElement);
  }

  statusMessage.textContent = visibleTasks.length === tasks.length
    ? `${tasks.length} tasks loaded`
    : `${visibleTasks.length} of ${tasks.length} tasks shown`;
}

async function loadTasks() {
  statusMessage.textContent = "Loading tasks...";
  document.querySelector("#refresh").disabled = true;
  try {
    const response = await fetch("/api/tasks");
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const loadedTasks = await response.json();
    tasks = Array.isArray(loadedTasks) ? loadedTasks : [];
    updateSummary();
    renderBoard();
  } catch (error) {
    tasks = [];
    updateSummary();
    document.querySelector("#kanban").replaceChildren();
    statusMessage.textContent = `Unable to load tasks: ${error.message}`;
  } finally {
    document.querySelector("#refresh").disabled = false;
  }
}

function syncSearch(source, target) {
  target.value = source.value;
  renderBoard();
}

globalSearch.addEventListener("input", () => syncSearch(globalSearch, taskSearch));
taskSearch.addEventListener("input", () => syncSearch(taskSearch, globalSearch));
priorityFilter.addEventListener("change", renderBoard);
statusFilter.addEventListener("change", renderBoard);
document.querySelector("#clear-filters").addEventListener("click", () => {
  globalSearch.value = "";
  taskSearch.value = "";
  priorityFilter.value = "";
  statusFilter.value = "";
  renderBoard();
});
document.querySelector("#refresh").addEventListener("click", loadTasks);
document.querySelector("#menu-button").addEventListener("click", (event) => {
  const sidebar = document.querySelector("#sidebar");
  const open = sidebar.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
});

loadProfile();
loadTasks();
