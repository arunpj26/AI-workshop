let tasks = [];

const statusLabels = {
  OPEN: "To Do",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold"
};
const columns = ["OPEN", "IN_PROGRESS", "COMPLETED", "ON_HOLD"];

function normalizeStatus(status) {
  return Object.hasOwn(statusLabels, status) ? status : "ON_HOLD";
}

function initials(name) {
  if (!name) return "UV";
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

async function loadProfile(profileId) {
  const query = profileId ? `?profile=${encodeURIComponent(profileId)}` : "";
  const response = await fetch(`/api/users/current${query}`);
  if (!response.ok) throw new Error(`Unable to load profile (${response.status})`);
  const profile = await response.json();
  const name = profile.name || "UVJTaskFlow user";
  const role = profile.role || "Team member";
  document.querySelector("#welcome-name").textContent = name;
  document.querySelector("#profile-name").textContent = name;
  document.querySelector("#profile-role").textContent = role;
  const avatar = document.querySelector("#profile-avatar");
  avatar.replaceChildren();
  if (profile.imageUrl) {
    const image = document.createElement("img");
    image.src = profile.imageUrl;
    image.alt = "";
    image.addEventListener("error", () => {
      avatar.replaceChildren();
      avatar.textContent = initials(name);
    }, { once: true });
    avatar.appendChild(image);
  } else {
    avatar.textContent = initials(name);
  }
}

async function loadProfiles() {
  const response = await fetch("/api/users/profiles");
  if (!response.ok) throw new Error(`Unable to load profiles (${response.status})`);
  const profiles = await response.json();
  const select = document.querySelector("#profile-select");
  select.replaceChildren();
  for (const profile of profiles) {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.name || "Demo User";
    select.appendChild(option);
  }
  await loadProfile(select.value);
  select.addEventListener("change", async () => {
    try { await loadProfile(select.value); }
    catch (error) { document.querySelector("#status").textContent = error.message; }
  });
}

function filteredTasks() {
  const search = document.querySelector("#global-search").value.trim().toLowerCase();
  const taskSearch = document.querySelector("#task-search").value.trim().toLowerCase();
  const priority = document.querySelector("#priority-filter").value;
  const status = document.querySelector("#status-filter").value;
  const term = `${search} ${taskSearch}`.trim();
  return tasks.filter(task => {
    const haystack = `${task.title || ""} ${task.description || ""}`.toLowerCase();
    return (!term || haystack.includes(term))
      && (!priority || task.priority === priority)
      && (!status || normalizeStatus(task.status) === status);
  });
}

function updateSummary(visibleTasks) {
  document.querySelector("#total-count").textContent = visibleTasks.length;
  document.querySelector("#completed-count").textContent = visibleTasks.filter(task => normalizeStatus(task.status) === "COMPLETED").length;
  document.querySelector("#progress-count").textContent = visibleTasks.filter(task => normalizeStatus(task.status) === "IN_PROGRESS").length;
  document.querySelector("#todo-count").textContent = visibleTasks.filter(task => normalizeStatus(task.status) === "OPEN").length;
}

function createCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";
  const priority = document.createElement("span");
  priority.className = `priority-badge ${String(task.priority || "").toLowerCase()}`;
  priority.textContent = task.priority || "No priority";
  const title = document.createElement("h3");
  title.textContent = task.title || "Untitled task";
  const description = document.createElement("p");
  description.textContent = task.description || "";
  card.append(priority, title, description);
  return card;
}

function renderBoard() {
  const visibleTasks = filteredTasks();
  updateSummary(tasks);
  const board = document.querySelector("#tasks");
  board.replaceChildren();
  for (const status of columns) {
    const columnTasks = visibleTasks.filter(task => normalizeStatus(task.status) === status);
    const column = document.createElement("section");
    column.className = "kanban-column";
    column.setAttribute("aria-label", statusLabels[status]);
    const heading = document.createElement("header");
    const dot = document.createElement("span");
    dot.className = `status-dot ${status.toLowerCase()}`;
    const title = document.createElement("h3");
    title.textContent = statusLabels[status];
    const count = document.createElement("span");
    count.className = "column-count";
    count.textContent = columnTasks.length;
    heading.append(dot, title, count);
    column.appendChild(heading);
    for (const task of columnTasks) column.appendChild(createCard(task));
    board.appendChild(column);
  }
  document.querySelector("#status").textContent = `${visibleTasks.length} of ${tasks.length} tasks shown`;
}

async function loadTasks() {
  const status = document.querySelector("#status");
  status.textContent = "Loading tasks…";
  try {
    const response = await fetch("/api/tasks");
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    tasks = await response.json();
    renderBoard();
  } catch (error) {
    status.textContent = `Unable to load tasks: ${error.message}`;
  }
}

document.querySelector("#clear-filters").addEventListener("click", () => {
  document.querySelector("#global-search").value = "";
  document.querySelector("#task-search").value = "";
  document.querySelector("#priority-filter").value = "";
  document.querySelector("#status-filter").value = "";
  renderBoard();
});
for (const id of ["global-search", "task-search", "priority-filter", "status-filter"]) {
  document.querySelector(`#${id}`).addEventListener(id.includes("search") ? "input" : "change", renderBoard);
}

Promise.all([loadTasks(), loadProfiles()]).catch(error => {
  document.querySelector("#status").textContent = `Unable to load dashboard: ${error.message}`;
});
