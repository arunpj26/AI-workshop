const tasksEndpoint = "/api/tasks";
const profileEndpoint = "/api/users/current";
const tasks = [];
const laneDefinitions = [
  { status: "OPEN", title: "To Do", className: "lane-todo" },
  { status: "IN_PROGRESS", title: "In Progress", className: "lane-progress" },
  { status: "COMPLETED", title: "Completed", className: "lane-completed" },
  { status: "ON_HOLD", title: "On Hold", className: "lane-hold" }
];
const otherLane = { status: "OTHER", title: "Other", className: "lane-other" };
const avatarColors = ["#2f6f8f", "#7b4a9a", "#a34f26", "#2a7a43", "#9c3656", "#4656a8"];
const icons = {
  plus: "M12 5v14M5 12h14",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  document: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5V12l3 2",
  subtasks: "M4 4h12v9H4zM8 17h12v-9M7 8.5l1.5 1.5L12 7",
  comment: "M4 5h16v11H9l-5 4z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"
};

const taskStatus = document.querySelector("#task-status");
const boardFeedback = document.querySelector("#board-feedback");
const retryButton = document.querySelector("#retry-tasks");
const taskBoard = document.querySelector("#task-board");
const searchInput = document.querySelector("#task-search");
const globalSearchInput = document.querySelector("#global-search");
const priorityFilter = document.querySelector("#priority-filter");
const statusFilter = document.querySelector("#status-filter");
const assigneeFilter = document.querySelector("#assignee-filter");
const projectFilter = document.querySelector("#project-filter");
const dateFrom = document.querySelector("#date-from");
const dateTo = document.querySelector("#date-to");
const reloadButton = document.querySelector("#reload");
const createTaskButton = document.querySelector("#create-task");
const sidebar = document.querySelector("#sidebar");
const sidebarToggle = document.querySelector("#sidebar-toggle");
const sidebarBackdrop = document.querySelector("#sidebar-backdrop");
const mobileQuery = window.matchMedia("(max-width: 760px)");
const taskDialog = document.querySelector("#task-dialog");
const taskForm = document.querySelector("#task-form");
const newTitle = document.querySelector("#new-title");
const newDescription = document.querySelector("#new-description");
const newStatus = document.querySelector("#new-status");
const newPriority = document.querySelector("#new-priority");
const newAssignees = document.querySelector("#new-assignees");
const newEstimate = document.querySelector("#new-estimate");
const newDueDate = document.querySelector("#new-due-date");
const newProject = document.querySelector("#new-project");
const titleError = document.querySelector("#new-title-error");
const estimateError = document.querySelector("#new-estimate-error");
const formError = document.querySelector("#task-form-error");
const submitButton = document.querySelector("#task-form-submit");
let dialogOpener = null;

function normalized(value) {
  return typeof value === "string" ? value.trim() : "";
}

function statusOf(task) {
  return normalized(task.status).toUpperCase();
}

function assigneesOf(task) {
  return Array.isArray(task.assignees) ? task.assignees.map(normalized).filter(Boolean) : [];
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function createIcon(pathData, extraClass = "") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", `icon ${extraClass}`.trim());
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  svg.appendChild(path);
  return svg;
}

function hiddenText(text) {
  const span = document.createElement("span");
  span.className = "visually-hidden";
  span.textContent = text;
  return span;
}

function setFeedback(message, { visible = false, error = false } = {}) {
  taskStatus.textContent = message;
  boardFeedback.classList.toggle("is-quiet", !visible);
  boardFeedback.classList.toggle("is-error", error);
}

function updateSummary() {
  const countFor = (status) => String(tasks.filter((task) => statusOf(task) === status).length);
  document.querySelector("#count-total").textContent = String(tasks.length);
  document.querySelector("#count-completed").textContent = countFor("COMPLETED");
  document.querySelector("#count-progress").textContent = countFor("IN_PROGRESS");
  document.querySelector("#count-todo").textContent = countFor("OPEN");
}

function syncOptions(select, values, allLabel, prefix) {
  const current = select.value;
  const options = [new Option(allLabel, "")];
  values.forEach((value) => options.push(new Option(`${prefix}${value}`, value)));
  select.replaceChildren(...options);
  select.value = values.includes(current) ? current : "";
}

function refreshFilterOptions() {
  const sorted = (values) => [...new Set(values)].sort((a, b) => a.localeCompare(b));
  syncOptions(assigneeFilter, sorted(tasks.flatMap(assigneesOf)), "Assignee: All", "Assignee: ");
  syncOptions(projectFilter, sorted(tasks.map((task) => normalized(task.project)).filter(Boolean)), "All Projects", "");
}

function laneFor(status) {
  return laneDefinitions.find((lane) => lane.status === normalized(status).toUpperCase());
}

function taskMatchesFilters(task) {
  const queries = [searchInput.value, globalSearchInput.value].map((value) => normalized(value).toLowerCase()).filter(Boolean);
  const priority = normalized(task.priority).toUpperCase();
  const status = statusOf(task);
  const assignees = assigneesOf(task);
  const selectedStatus = statusFilter.value;
  const searchableText = [task.title, task.description, task.key, task.project, status, priority, ...assignees]
    .map(normalized).join(" ").toLowerCase();

  if (queries.some((query) => !searchableText.includes(query))) return false;
  if (priorityFilter.value && priority !== priorityFilter.value) return false;
  if (selectedStatus === "OTHER" && laneFor(status)) return false;
  if (selectedStatus && selectedStatus !== "OTHER" && status !== selectedStatus) return false;
  if (assigneeFilter.value && !assignees.includes(assigneeFilter.value)) return false;
  if (projectFilter.value && normalized(task.project) !== projectFilter.value) return false;
  if (dateFrom.value || dateTo.value) {
    const due = normalized(task.dueDate).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) return false;
    if (dateFrom.value && due < dateFrom.value) return false;
    if (dateTo.value && due > dateTo.value) return false;
  }
  return true;
}

function initialsFor(name) {
  return normalized(name).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

function createAssigneeGroup(assignees) {
  const group = document.createElement("span");
  group.className = "assignees";
  group.setAttribute("role", "img");
  group.setAttribute("aria-label", `Assignees: ${assignees.join(", ")}`);
  assignees.slice(0, 3).forEach((name) => {
    const avatar = document.createElement("span");
    avatar.className = "mini-avatar";
    avatar.title = name;
    const colorIndex = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarColors.length;
    avatar.style.backgroundColor = avatarColors[colorIndex];
    avatar.textContent = initialsFor(name);
    group.appendChild(avatar);
  });
  if (assignees.length > 3) {
    const more = document.createElement("span");
    more.className = "mini-avatar mini-avatar-more";
    more.textContent = `+${assignees.length - 3}`;
    group.appendChild(more);
  }
  return group;
}

function createStat(iconPath, label, value) {
  const item = document.createElement("span");
  item.className = "task-stat";
  item.title = label;
  item.append(createIcon(iconPath), hiddenText(`${label}: `), document.createTextNode(value));
  return item;
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";

  const priority = normalized(task.priority);
  const badge = document.createElement("span");
  const priorityClass = ["HIGH", "MEDIUM", "LOW"].includes(priority.toUpperCase()) ? priority.toLowerCase() : "unknown";
  badge.className = `priority-badge priority-${priorityClass}`;
  badge.textContent = priority ? `${priority[0].toUpperCase()}${priority.slice(1).toLowerCase()}` : "No priority";
  card.appendChild(badge);

  const title = document.createElement("h4");
  title.textContent = normalized(task.title) || "Untitled task";
  card.appendChild(title);

  const description = normalized(task.description);
  if (description) {
    const details = document.createElement("p");
    details.className = "task-description";
    details.textContent = description;
    card.appendChild(details);
  }

  const key = normalized(task.key);
  if (key) {
    const keyLine = document.createElement("p");
    keyLine.className = "task-key";
    keyLine.append(createIcon(icons.document), hiddenText("Task key: "), document.createTextNode(key));
    card.appendChild(keyLine);
  }

  const footer = document.createElement("div");
  footer.className = "task-footer";
  const assignees = assigneesOf(task);
  if (assignees.length > 0) footer.appendChild(createAssigneeGroup(assignees));

  const stats = document.createElement("span");
  stats.className = "task-stats";
  if (Number.isFinite(task.estimateHours) && task.estimateHours > 0) stats.appendChild(createStat(icons.clock, "Estimate", `${task.estimateHours}h`));
  if (isCount(task.subtaskCount)) stats.appendChild(createStat(icons.subtasks, "Subtasks", String(task.subtaskCount)));
  if (isCount(task.commentCount)) stats.appendChild(createStat(icons.comment, "Comments", String(task.commentCount)));
  if (stats.childElementCount > 0) footer.appendChild(stats);
  if (footer.childElementCount > 0) card.appendChild(footer);
  return card;
}

function createAddButton(lane, className, visibleText) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.dataset.addStatus = lane.status;
  button.appendChild(createIcon(icons.plus));
  if (visibleText) {
    button.append(document.createTextNode(visibleText), hiddenText(` to ${lane.title}`));
  } else {
    button.setAttribute("aria-label", `Add task to ${lane.title}`);
    button.title = "Add task";
  }
  return button;
}

function renderLane(lane, laneTasks) {
  const section = document.createElement("section");
  section.className = `lane ${lane.className}`;
  const headingId = `lane-${lane.status.toLowerCase()}-title`;
  section.setAttribute("aria-labelledby", headingId);

  const header = document.createElement("div");
  header.className = "lane-header";
  const marker = document.createElement("span");
  marker.className = "lane-marker";
  marker.setAttribute("aria-hidden", "true");
  const heading = document.createElement("h3");
  heading.id = headingId;
  heading.textContent = lane.title;
  const count = document.createElement("span");
  count.className = "lane-count";
  count.append(document.createTextNode(String(laneTasks.length)), hiddenText(laneTasks.length === 1 ? " task" : " tasks"));
  header.append(marker, heading, count);

  if (lane !== otherLane) {
    const actions = document.createElement("span");
    actions.className = "lane-actions";
    const moreButton = document.createElement("button");
    moreButton.type = "button";
    moreButton.className = "icon-button";
    moreButton.setAttribute("aria-disabled", "true");
    moreButton.setAttribute("aria-label", `More actions for ${lane.title} (coming soon)`);
    moreButton.title = "Coming soon";
    moreButton.appendChild(createIcon(icons.more, "icon-dots"));
    actions.append(createAddButton(lane, "icon-button", ""), moreButton);
    header.appendChild(actions);
  }
  section.appendChild(header);

  const cardList = document.createElement("div");
  cardList.className = "lane-cards";
  if (laneTasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "lane-empty";
    empty.textContent = "No tasks here";
    cardList.appendChild(empty);
  } else {
    laneTasks.forEach((task) => cardList.appendChild(createTaskCard(task)));
  }
  section.appendChild(cardList);

  if (lane !== otherLane) section.appendChild(createAddButton(lane, "lane-add", "Add Task"));
  return section;
}

function renderBoard() {
  const matchingTasks = tasks.filter(taskMatchesFilters);
  const lanes = tasks.some((task) => !laneFor(task.status)) ? [...laneDefinitions, otherLane] : laneDefinitions;

  const children = [];
  if (tasks.length > 0 && matchingTasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "board-empty";
    empty.textContent = "No tasks match these filters.";
    children.push(empty);
  }
  const laneRow = document.createElement("div");
  laneRow.className = "lanes";
  for (const lane of lanes) {
    const laneTasks = matchingTasks.filter((task) => (lane === otherLane ? !laneFor(task.status) : statusOf(task) === lane.status));
    laneRow.appendChild(renderLane(lane, laneTasks));
  }
  children.push(laneRow);
  taskBoard.replaceChildren(...children);
}

async function loadTasks() {
  setFeedback("Loading tasks...", { visible: true });
  retryButton.hidden = true;
  taskBoard.setAttribute("aria-busy", "true");
  reloadButton.disabled = true;
  try {
    const response = await fetch(tasksEndpoint, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const result = await response.json();
    if (!Array.isArray(result)) throw new Error("The task response was not a list.");
    tasks.splice(0, tasks.length, ...result.filter((task) => task && typeof task === "object"));
    refreshFilterOptions();
    updateSummary();
    renderBoard();
    setFeedback(`${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} loaded`);
  } catch (error) {
    tasks.splice(0, tasks.length);
    refreshFilterOptions();
    updateSummary();
    taskBoard.replaceChildren();
    setFeedback(`Unable to load tasks. ${error.message}`, { visible: true, error: true });
    retryButton.hidden = false;
  } finally {
    taskBoard.setAttribute("aria-busy", "false");
    reloadButton.disabled = false;
  }
}

function isSafeImageUrl(value) {
  const url = normalized(value).toLowerCase();
  return url.startsWith("https://") || url.startsWith("http://") || (url.startsWith("/") && !url.startsWith("//"));
}

function showInitials(avatar, initials) {
  if (initials) {
    avatar.textContent = initials;
  } else {
    avatar.replaceChildren(createIcon(icons.user));
  }
}

function renderAvatar(name, imageUrl) {
  const avatar = document.querySelector("#profile-avatar");
  const initials = initialsFor(name);
  avatar.replaceChildren();
  if (isSafeImageUrl(imageUrl)) {
    const image = document.createElement("img");
    image.alt = "";
    image.src = imageUrl;
    image.addEventListener("error", () => {
      avatar.replaceChildren();
      showInitials(avatar, initials);
    }, { once: true });
    avatar.appendChild(image);
  } else {
    showInitials(avatar, initials);
  }
}

function renderGreeting(name) {
  const title = document.querySelector("#welcome-title");
  const nameLine = document.createElement("span");
  nameLine.className = "welcome-name";
  if (name) {
    const lead = document.createElement("span");
    lead.className = "welcome-lead";
    lead.textContent = "Welcome back,";
    nameLine.textContent = `${name}!`;
    title.replaceChildren(lead, document.createTextNode(" "), nameLine);
  } else {
    nameLine.textContent = "Welcome back!";
    title.replaceChildren(nameLine);
  }
}

async function loadProfile() {
  const profileStatus = document.querySelector("#profile-status");
  try {
    const response = await fetch(profileEndpoint, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const profile = await response.json();
    const name = normalized(profile?.name);
    renderGreeting(name);
    document.querySelector("#profile-name").textContent = name || "Profile unavailable";
    document.querySelector("#profile-role").textContent = normalized(profile?.role);
    profileStatus.textContent = "";
    renderAvatar(name, normalized(profile?.imageUrl));
  } catch {
    renderGreeting("");
    document.querySelector("#profile-name").textContent = "Profile unavailable";
    document.querySelector("#profile-role").textContent = "";
    profileStatus.textContent = "Profile could not be loaded";
    renderAvatar("", "");
  }
}

function clearFormErrors() {
  for (const [field, message] of [[newTitle, titleError], [newEstimate, estimateError]]) {
    field.removeAttribute("aria-invalid");
    message.textContent = "";
  }
  formError.textContent = "";
}

function showFieldError(field, message, text) {
  field.setAttribute("aria-invalid", "true");
  message.textContent = text;
}

function openCreateDialog(status, opener) {
  dialogOpener = opener;
  taskForm.reset();
  clearFormErrors();
  newStatus.value = laneFor(status) ? status : "OPEN";
  taskDialog.showModal();
  newTitle.focus();
}

async function errorMessageFrom(response) {
  let detail = "";
  try {
    const body = await response.json();
    detail = [body?.message, body?.detail, body?.error].map(normalized).find(Boolean) || "";
  } catch {
    detail = "";
  }
  return detail ? `${detail} (${response.status})` : `Request failed (${response.status})`;
}

async function submitTask(event) {
  event.preventDefault();
  clearFormErrors();
  const title = normalized(newTitle.value);
  const estimateText = newEstimate.value.trim();
  let estimateHours = null;
  if (!title) showFieldError(newTitle, titleError, "Enter a task title.");
  if (estimateText !== "" || newEstimate.validity.badInput) {
    const value = Number(estimateText);
    if (newEstimate.validity.badInput || !Number.isInteger(value) || value < 0) {
      showFieldError(newEstimate, estimateError, "Enter whole hours of 0 or more.");
    } else {
      estimateHours = value;
    }
  }
  const firstInvalid = taskForm.querySelector("[aria-invalid='true']");
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const payload = { title, status: newStatus.value, priority: newPriority.value };
  const description = normalized(newDescription.value);
  const assignees = [...new Set(newAssignees.value.split(",").map(normalized).filter(Boolean))];
  const project = normalized(newProject.value);
  if (description) payload.description = description;
  if (assignees.length > 0) payload.assignees = assignees;
  if (estimateHours !== null) payload.estimateHours = estimateHours;
  if (project) payload.project = project;
  if (newDueDate.value) payload.dueDate = newDueDate.value;

  submitButton.disabled = true;
  submitButton.textContent = "Creating...";
  try {
    const response = await fetch(tasksEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(await errorMessageFrom(response));
    taskDialog.close();
    await loadTasks();
    if (!boardFeedback.classList.contains("is-error")) setFeedback(`Task created. ${taskStatus.textContent}`);
    if (document.activeElement === document.body) taskBoard.focus();
  } catch (error) {
    formError.textContent = `Unable to create task. ${error.message}`;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Create Task";
  }
}

function setSidebarOpen(open) {
  document.body.classList.toggle("sidebar-open", open);
  sidebarToggle.setAttribute("aria-expanded", String(open));
  sidebarToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  sidebarBackdrop.hidden = !open;
  sidebar.inert = mobileQuery.matches && !open;
  if (open) sidebar.querySelector(".nav-link")?.focus();
}

function clearFilters() {
  for (const input of [searchInput, globalSearchInput, dateFrom, dateTo]) input.value = "";
  for (const select of [priorityFilter, statusFilter, assigneeFilter, projectFilter]) select.value = "";
  renderBoard();
  searchInput.focus();
}

document.querySelector("#task-filters").addEventListener("submit", (event) => event.preventDefault());
for (const input of [searchInput, globalSearchInput]) input.addEventListener("input", renderBoard);
for (const control of [priorityFilter, statusFilter, assigneeFilter, projectFilter, dateFrom, dateTo]) control.addEventListener("change", renderBoard);
document.querySelector("#clear-filters").addEventListener("click", clearFilters);
reloadButton.addEventListener("click", loadTasks);
retryButton.addEventListener("click", loadTasks);
createTaskButton.addEventListener("click", () => openCreateDialog("OPEN", createTaskButton));
taskBoard.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-status]");
  if (addButton) openCreateDialog(addButton.dataset.addStatus, addButton);
});
taskForm.addEventListener("submit", submitTask);
document.querySelector("#task-dialog-close").addEventListener("click", () => taskDialog.close());
document.querySelector("#task-dialog-cancel").addEventListener("click", () => taskDialog.close());
taskDialog.addEventListener("click", (event) => {
  if (event.target === taskDialog) taskDialog.close();
});
taskDialog.addEventListener("close", () => {
  if (dialogOpener?.isConnected) dialogOpener.focus();
  dialogOpener = null;
});

sidebarToggle.addEventListener("click", () => setSidebarOpen(!document.body.classList.contains("sidebar-open")));
sidebarBackdrop.addEventListener("click", () => setSidebarOpen(false));
sidebar.addEventListener("click", (event) => {
  if (mobileQuery.matches && event.target.closest("a")) setSidebarOpen(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("sidebar-open")) {
    setSidebarOpen(false);
    sidebarToggle.focus();
  }
});
mobileQuery.addEventListener("change", () => setSidebarOpen(false));

setSidebarOpen(false);
loadTasks();
loadProfile();
