const columnIds = ["todo", "in-progress", "completed", "on-hold"];

function statusColumn(status) {
  const normalized = String(status || "").trim().toUpperCase().replace(/[- ]/g, "_");
  if (normalized === "OPEN" || normalized === "TODO" || normalized === "TO_DO") return "todo";
  if (normalized === "IN_PROGRESS" || normalized === "INPROGRESS") return "in-progress";
  if (normalized === "COMPLETED" || normalized === "DONE") return "completed";
  return "on-hold";
}

function initials(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  return words.length > 1 ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase() : (words[0]?.[0] || "?").toUpperCase();
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

function renderProfile(profile) {
  const name = profile?.name || "Current user";
  const role = profile?.role || "TaskFlow member";
  document.querySelector("#profile-name").textContent = name;
  document.querySelector("#profile-role").textContent = role;
  document.querySelector("#welcome-name").textContent = name;

  const currentAvatar = document.querySelector("#profile .avatar");
  if (profile?.imageUrl) {
    const image = document.createElement("img");
    image.className = "avatar";
    image.alt = `${name} profile`;
    image.src = profile.imageUrl;
    image.addEventListener("error", () => image.replaceWith(makeInitialAvatar(name)));
    currentAvatar.replaceWith(image);
  } else {
    currentAvatar.replaceWith(makeInitialAvatar(name));
  }
}

function makeInitialAvatar(name) {
  const avatar = document.createElement("div");
  avatar.className = "avatar avatar-fallback";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = initials(name);
  return avatar;
}

function makeTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";
  const priority = String(task.priority || "Normal").toLowerCase();
  const badge = document.createElement("span");
  badge.className = `priority ${priority}`;
  badge.textContent = task.priority || "Normal";
  const title = document.createElement("h4");
  title.textContent = task.title || "Untitled task";
  const description = document.createElement("p");
  description.textContent = task.description || "No description provided.";
  const meta = document.createElement("span");
  meta.className = "task-meta";
  meta.textContent = `Task #${task.id}`;
  card.append(badge, title, description, meta);
  return card;
}

function renderTasks(tasks) {
  const grouped = Object.fromEntries(columnIds.map((id) => [id, []]));
  tasks.forEach((task) => grouped[statusColumn(task.status)].push(task));
  columnIds.forEach((column) => {
    const list = document.querySelector(`#${column === "in-progress" ? "progress" : column === "on-hold" ? "hold" : column}-tasks`);
    const count = document.querySelector(`#${column === "in-progress" ? "progress" : column === "on-hold" ? "hold" : column}-column-count`);
    list.replaceChildren(...grouped[column].map(makeTaskCard));
    count.textContent = grouped[column].length;
    if (!grouped[column].length) {
      const empty = document.createElement("p");
      empty.className = "empty-column";
      empty.textContent = "No tasks here";
      list.append(empty);
    }
  });
  document.querySelector("#total-count").textContent = tasks.length;
  document.querySelector("#todo-count").textContent = grouped.todo.length;
  document.querySelector("#progress-count").textContent = grouped["in-progress"].length;
  document.querySelector("#completed-count").textContent = grouped.completed.length;
}

async function loadTasks() {
  const status = document.querySelector("#status");
  status.className = "status-message";
  status.textContent = "Loading tasks...";
  try {
    const [tasks, profileResult] = await Promise.all([getJson("/api/tasks"), getJson("/api/users/current").catch(() => null)]);
    renderTasks(Array.isArray(tasks) ? tasks : []);
    if (profileResult) renderProfile(profileResult);
    status.textContent = tasks.length ? `${tasks.length} tasks loaded` : "No tasks found";
  } catch (error) {
    status.className = "status-message error";
    status.textContent = `Unable to load tasks: ${error.message}`;
    renderTasks([]);
  }
}

document.querySelector("#reload").addEventListener("click", loadTasks);
loadTasks();
