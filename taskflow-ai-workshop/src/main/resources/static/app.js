async function loadTasks() {
  const status = document.querySelector("#status");
  const tbody = document.querySelector("#tasks");
  status.textContent = "Loading tasks…";
  try {
    const response = await fetch("/api/tasks");
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const tasks = await response.json();
    tbody.replaceChildren();
    for (const task of tasks) {
      const row = document.createElement("tr");
      for (const value of [task.title, task.description, task.status]) {
        const cell = document.createElement("td"); cell.textContent = value; row.appendChild(cell);
      }
      const cell = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = `priority ${task.priority}`; badge.textContent = task.priority;
      cell.appendChild(badge); row.appendChild(cell); tbody.appendChild(row);
    }
    status.textContent = `${tasks.length} tasks loaded`;
  } catch (error) { status.textContent = `Unable to load tasks: ${error.message}`; }
}
document.querySelector("#reload").addEventListener("click", loadTasks);
loadTasks();
