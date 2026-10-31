"use strict";

const COLUMN_STATUSES = ["OPEN", "IN_PROGRESS", "COMPLETED", "ON_HOLD"];
const PRIORITY_LABELS = { HIGH: "High", MEDIUM: "Medium", LOW: "Low" };

const state = { tasks: [], loaded: false, userName: null };

const elements = {
  sidebar: document.querySelector("#sidebar"),
  navToggle: document.querySelector("#nav-toggle"),
  greeting: document.querySelector("#greeting"),
  userName: document.querySelector("#user-name"),
  userRole: document.querySelector("#user-role"),
  avatarImg: document.querySelector("#user-avatar-img"),
  avatarInitials: document.querySelector("#user-avatar-initials"),
  avatarIcon: document.querySelector("#user-avatar-icon"),
  search: document.querySelector("#task-search"),
  priorityFilter: document.querySelector("#priority-filter"),
  statusFilter: document.querySelector("#status-filter"),
  clearFilters: document.querySelector("#clear-filters"),
  boardStatus: document.querySelector("#board-status"),
  retry: document.querySelector("#retry-tasks"),
  summary: {
    total: document.querySelector("#summary-total"),
    completed: document.querySelector("#summary-completed"),
    inProgress: document.querySelector("#summary-in-progress"),
    todo: document.querySelector("#summary-todo"),
  },
  columns: [...document.querySelectorAll(".column[data-status]")],
};

function hasText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function getInitials(name) {
  const words = name.trim().split(/\s+/);
  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

function pluralizeTasks(count) {
  return `${count} ${count === 1 ? "task" : "tasks"}`;
}

/* ---------- User profile ---------- */

function showAvatar(mode) {
  // toggleAttribute is used because the SVG icon has no `hidden` DOM property.
  elements.avatarImg.toggleAttribute("hidden", mode !== "image");
  elements.avatarInitials.toggleAttribute("hidden", mode !== "initials");
  elements.avatarIcon.toggleAttribute("hidden", mode !== "icon");
}

function showFallbackAvatar() {
  if (state.userName) {
    elements.avatarInitials.textContent = getInitials(state.userName);
    showAvatar("initials");
  } else {
    showAvatar("icon");
  }
}

function renderGreeting(name) {
  if (!name) {
    elements.greeting.textContent = "Welcome back!";
    return;
  }
  const lead = document.createElement("span");
  lead.className = "greeting-lead";
  lead.textContent = "Welcome back, ";
  const nameLine = document.createElement("span");
  nameLine.textContent = `${name}!`;
  elements.greeting.replaceChildren(lead, nameLine);
}

function renderUser(profile) {
  const name = hasText(profile?.name) ? profile.name.trim() : null;
  const role = hasText(profile?.role) ? profile.role.trim() : null;
  const imageUrl = hasText(profile?.imageUrl) ? profile.imageUrl.trim() : null;
  state.userName = name;

  renderGreeting(name);

  elements.userName.textContent = name ?? "";
  elements.userName.hidden = !name;
  elements.userRole.textContent = role ?? "";
  elements.userRole.hidden = !role;

  if (imageUrl) {
    elements.avatarImg.alt = name ?? "";
    elements.avatarImg.src = imageUrl;
    showAvatar("image");
  } else {
    elements.avatarImg.removeAttribute("src");
    showFallbackAvatar();
  }
}

async function loadCurrentUser() {
  try {
    const response = await fetch("/api/users/current", { cache: "no-store" });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    renderUser(await response.json());
  } catch {
    renderUser(null);
  }
}

/* ---------- Tasks ---------- */

function setBoardStatus(message, isError = false) {
  elements.boardStatus.textContent = message;
  elements.boardStatus.classList.toggle("is-error", isError);
  elements.boardStatus.setAttribute("role", isError ? "alert" : "status");
  elements.retry.hidden = !isError;
}

function renderSummary(tasks) {
  if (!tasks) {
    for (const node of Object.values(elements.summary)) node.textContent = "–";
    return;
  }
  const countBy = (status) => tasks.filter((task) => task.status === status).length;
  elements.summary.total.textContent = String(tasks.length);
  elements.summary.completed.textContent = String(countBy("COMPLETED"));
  elements.summary.inProgress.textContent = String(countBy("IN_PROGRESS"));
  elements.summary.todo.textContent = String(countBy("OPEN"));
}

function getFilters() {
  return {
    query: elements.search.value.trim().toLowerCase(),
    priority: elements.priorityFilter.value,
    status: elements.statusFilter.value,
  };
}

function filtersActive(filters) {
  return filters.query !== "" || filters.priority !== "ALL" || filters.status !== "ALL";
}

function matchesFilters(task, filters) {
  if (filters.priority !== "ALL" && task.priority !== filters.priority) return false;
  if (filters.status !== "ALL" && task.status !== filters.status) return false;
  if (filters.query) {
    const haystack = `${task.title ?? ""} ${task.description ?? ""}`.toLowerCase();
    if (!haystack.includes(filters.query)) return false;
  }
  return true;
}

function createTaskCard(task) {
  const item = document.createElement("li");
  const card = document.createElement("article");
  card.className = "task-card";

  const priorityLabel = PRIORITY_LABELS[task.priority];
  if (priorityLabel) {
    const badge = document.createElement("span");
    badge.className = `priority-badge priority-${task.priority.toLowerCase()}`;
    const prefix = document.createElement("span");
    prefix.className = "visually-hidden";
    prefix.textContent = "Priority: ";
    badge.append(prefix, priorityLabel);
    card.appendChild(badge);
  }

  const title = document.createElement("h4");
  title.textContent = hasText(task.title) ? task.title : "Untitled task";
  card.appendChild(title);

  if (hasText(task.description)) {
    const description = document.createElement("p");
    description.textContent = task.description;
    card.appendChild(description);
  }

  item.appendChild(card);
  return item;
}

function setColumnCount(node, count) {
  const hidden = document.createElement("span");
  hidden.className = "visually-hidden";
  hidden.textContent = count === 1 ? " task" : " tasks";
  node.replaceChildren(String(count), hidden);
}

function renderBoard() {
  const filters = getFilters();
  const active = filtersActive(filters);
  const visible = state.tasks.filter((task) => matchesFilters(task, filters));
  let shown = 0;

  for (const column of elements.columns) {
    const list = column.querySelector('[data-role="list"]');
    const count = column.querySelector('[data-role="count"]');
    const columnTasks = visible.filter((task) => task.status === column.dataset.status);
    shown += columnTasks.length;

    list.replaceChildren(...columnTasks.map(createTaskCard));
    if (columnTasks.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent = active ? "No matching tasks" : "No tasks";
      list.appendChild(empty);
    }
    setColumnCount(count, columnTasks.length);
  }

  if (active) {
    setBoardStatus(`Showing ${shown} of ${pluralizeTasks(state.tasks.length)}`);
  } else {
    setBoardStatus(`${pluralizeTasks(state.tasks.length)} loaded`);
  }
}

function clearBoard() {
  for (const column of elements.columns) {
    column.querySelector('[data-role="list"]').replaceChildren();
    column.querySelector('[data-role="count"]').textContent = "–";
  }
}

async function loadTasks() {
  setBoardStatus("Loading tasks…");
  try {
    const response = await fetch("/api/tasks", { cache: "no-store" });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const tasks = await response.json();
    if (!Array.isArray(tasks)) throw new Error("Unexpected response format");
    state.tasks = tasks.filter((task) => task && typeof task === "object");
    state.loaded = true;
    renderSummary(state.tasks);
    renderBoard();
  } catch (error) {
    state.tasks = [];
    state.loaded = false;
    renderSummary(null);
    clearBoard();
    setBoardStatus(`Unable to load tasks: ${error.message}`, true);
  }
}

function onFiltersChanged() {
  if (state.loaded) renderBoard();
}

/* ---------- Navigation ---------- */

function setNavOpen(open) {
  elements.sidebar.classList.toggle("is-open", open);
  elements.navToggle.setAttribute("aria-expanded", String(open));
}

/* ---------- Wiring ---------- */

elements.avatarImg.addEventListener("error", showFallbackAvatar);
elements.search.addEventListener("input", onFiltersChanged);
elements.priorityFilter.addEventListener("change", onFiltersChanged);
elements.statusFilter.addEventListener("change", onFiltersChanged);
elements.clearFilters.addEventListener("click", () => {
  elements.search.value = "";
  elements.priorityFilter.value = "ALL";
  elements.statusFilter.value = "ALL";
  onFiltersChanged();
});
elements.retry.addEventListener("click", loadTasks);
elements.navToggle.addEventListener("click", () => {
  setNavOpen(elements.navToggle.getAttribute("aria-expanded") !== "true");
});
for (const link of elements.sidebar.querySelectorAll("a.nav-item")) {
  link.addEventListener("click", () => {
    for (const other of elements.sidebar.querySelectorAll("a.nav-item")) other.removeAttribute("aria-current");
    link.setAttribute("aria-current", "page");
    setNavOpen(false);
  });
}

loadCurrentUser();
loadTasks();
