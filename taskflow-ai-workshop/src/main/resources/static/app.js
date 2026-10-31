const STATUS_COLUMNS = [
  { key: "OPEN", listId: "todo-tasks", countId: "todo-column-count" },
  { key: "IN_PROGRESS", listId: "progress-tasks", countId: "progress-column-count" },
  { key: "COMPLETED", listId: "completed-tasks", countId: "completed-column-count" },
  { key: "ON_HOLD", listId: "hold-tasks", countId: "hold-column-count" },
];

const tasksState = {
  all: [],
  loaded: false,
};

const taskSearch = document.querySelector("#task-search");
const priorityFilter = document.querySelector("#priority-filter");
const statusFilter = document.querySelector("#status-filter");
const taskStatus = document.querySelector("#task-status");
const taskError = document.querySelector("#task-error");
const profileError = document.querySelector("#profile-error");
const refreshButton = document.querySelector("#refresh");

function updateNavigation() {
  const activeSection = window.location.hash || "#overview";
  for (const link of document.querySelectorAll(".nav-link")) {
    const isActive = link.getAttribute("href") === activeSection;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

function errorText(error) {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}

function getInitials(name) {
  const initials = (name || "User")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase())
    .join("");
  return initials || "U";
}

function renderProfile(profile) {
  const name = typeof profile?.name === "string" ? profile.name.trim() : "";
  const role = typeof profile?.role === "string" ? profile.role.trim() : "";
  const imageUrl = typeof profile?.imageUrl === "string" ? profile.imageUrl.trim() : "";
  const displayName = name || "User";
  const avatar = document.querySelector("#profile-avatar");

  document.querySelector("#profile-name").textContent = displayName;
  document.querySelector("#profile-role").textContent = role;
  document.querySelector("#profile-role").hidden = !role;
  document.querySelector("#welcome-name").textContent = name ? `, ${name}` : "";
  avatar.replaceChildren();

  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "";
    image.addEventListener("error", () => {
      avatar.classList.add("avatar-fallback");
      avatar.textContent = getInitials(name);
    }, { once: true });
    avatar.classList.remove("avatar-fallback");
    avatar.appendChild(image);
    return;
  }

  avatar.classList.add("avatar-fallback");
  avatar.textContent = getInitials(name);
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";

  const priority = typeof task.priority === "string" ? task.priority.toUpperCase() : "";
  const badge = document.createElement("span");
  badge.className = `priority-badge ${["HIGH", "MEDIUM", "LOW"].includes(priority) ? priority : ""}`;
  badge.textContent = priority ? priority[0] + priority.slice(1).toLowerCase() : "Priority unavailable";
  card.appendChild(badge);

  const title = document.createElement("h4");
  title.textContent = typeof task.title === "string" && task.title.trim() ? task.title : "Untitled task";
  card.appendChild(title);

  if (typeof task.description === "string" && task.description.trim()) {
    const description = document.createElement("p");
    description.textContent = task.description;
    card.appendChild(description);
  }

  return card;
}

function matchesFilters(task) {
  const priority = priorityFilter.value;
  const status = statusFilter.value;
  const query = taskSearch.value.trim().toLocaleLowerCase();
  const taskPriority = typeof task.priority === "string" ? task.priority.toUpperCase() : "";
  const taskStatusValue = typeof task.status === "string" ? task.status.toUpperCase() : "";
  const searchableText = [
    task.title,
    task.description,
    taskPriority,
    taskStatusValue,
  ].filter((value) => typeof value === "string").join(" ").toLocaleLowerCase();

  return (!priority || taskPriority === priority)
    && (!status || taskStatusValue === status)
    && (!query || searchableText.includes(query));
}

function renderSummary(tasks) {
  document.querySelector("#total-count").textContent = tasks.length;
  document.querySelector("#completed-count").textContent =
    tasks.filter((task) => task.status === "COMPLETED").length;
  document.querySelector("#progress-count").textContent =
    tasks.filter((task) => task.status === "IN_PROGRESS").length;
  document.querySelector("#todo-count").textContent =
    tasks.filter((task) => task.status === "OPEN").length;
}

function renderTasks() {
  const visibleTasks = tasksState.all.filter(matchesFilters);
  const hasActiveFilters = Boolean(
    taskSearch.value.trim() || priorityFilter.value || statusFilter.value,
  );
  let visibleCount = 0;

  for (const column of STATUS_COLUMNS) {
    const columnTasks = visibleTasks.filter((task) => task.status === column.key);
    const list = document.querySelector(`#${column.listId}`);
    list.replaceChildren();
    document.querySelector(`#${column.countId}`).textContent = columnTasks.length;

    if (columnTasks.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "empty-column";
      emptyMessage.textContent = hasActiveFilters
        ? "No matching tasks."
        : "No tasks here yet.";
      list.appendChild(emptyMessage);
    } else {
      for (const task of columnTasks) {
        list.appendChild(createTaskCard(task));
        visibleCount += 1;
      }
    }
  }

  document.querySelector("#no-matches").hidden =
    !tasksState.loaded || tasksState.all.length === 0 || visibleCount !== 0;
  renderSummary(tasksState.all);
}

function validateTasks(tasks) {
  if (!Array.isArray(tasks)) {
    throw new Error("The tasks response was not a list.");
  }
  const unsupportedTask = tasks.find(
    (task) => !task || !STATUS_COLUMNS.some((column) => column.key === task.status),
  );
  if (unsupportedTask) {
    throw new Error("The tasks response contains an unsupported status.");
  }
  return tasks;
}

async function loadDashboard() {
  taskStatus.textContent = tasksState.loaded ? "Refreshing tasks..." : "Loading tasks...";
  taskError.hidden = true;
  profileError.hidden = true;
  refreshButton.disabled = true;

  const [tasksResult, profileResult] = await Promise.allSettled([
    fetchJson("/api/tasks").then(validateTasks),
    fetchJson("/api/users/current"),
  ]);

  if (tasksResult.status === "fulfilled") {
    tasksState.all = tasksResult.value;
    tasksState.loaded = true;
    taskStatus.textContent = `${tasksState.all.length} ${tasksState.all.length === 1 ? "task" : "tasks"} loaded`;
    renderTasks();
  } else {
    tasksState.all = [];
    tasksState.loaded = false;
    renderTasks();
    taskStatus.textContent = "Tasks could not be loaded.";
    taskError.textContent = `Unable to load tasks: ${errorText(tasksResult.reason)} Select Refresh to try again.`;
    taskError.hidden = false;
  }

  if (profileResult.status === "fulfilled") {
    renderProfile(profileResult.value);
  } else {
    renderProfile(null);
    profileError.textContent =
      `Unable to load the current user profile: ${errorText(profileResult.reason)} Showing a generic profile instead.`;
    profileError.hidden = false;
  }

  refreshButton.disabled = false;
}

taskSearch.addEventListener("input", renderTasks);
priorityFilter.addEventListener("change", renderTasks);
statusFilter.addEventListener("change", renderTasks);
document.querySelector("#clear-filters").addEventListener("click", () => {
  taskSearch.value = "";
  priorityFilter.value = "";
  statusFilter.value = "";
  renderTasks();
});
refreshButton.addEventListener("click", loadDashboard);
window.addEventListener("hashchange", updateNavigation);

updateNavigation();
loadDashboard();
