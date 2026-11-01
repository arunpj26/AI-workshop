// State management
let allTasks = [];
let filteredTasks = [];
let userProfile = null;
let hasLoadedTasks = false;
let activeFilters = {
  priority: '',
  status: '',
  assignee: '',
  search: ''
};

// DOM Elements
const globalSearch = document.querySelector('#global-search');
const taskSearch = document.querySelector('#task-search');
const priorityFilter = document.querySelector('#priority-filter');
const statusFilter = document.querySelector('#status-filter');
const assigneeFilter = document.querySelector('#assignee-filter');
const clearFiltersBtn = document.querySelector('#clear-filters');
const createTaskBtn = document.querySelector('#create-task-btn');
const refreshTasksBtn = document.querySelector('#refresh-tasks');
const retryLoadBtn = document.querySelector('#retry-load');
const boardStatus = document.querySelector('#board-status');
const kanbanBoard = document.querySelector('#kanban-board');
const emptyState = document.querySelector('#empty-state');
const userNameEl = document.querySelector('#user-name');
const userRoleEl = document.querySelector('#user-role');
const userAvatarEl = document.querySelector('#user-avatar');
const userInitialsEl = document.querySelector('#user-initials');
const welcomeGreetingEl = document.querySelector('#welcome-greeting');
const welcomeNameEl = document.querySelector('#welcome-name');
const welcomeSubtitleEl = document.querySelector('#welcome-subtitle');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  attachEventListeners();
  await Promise.all([
    loadUserProfile(),
    loadTasks()
  ]);
});

// Load user profile from API
async function loadUserProfile() {
  try {
    const response = await fetch('/api/users/current');
    if (!response.ok) {
      console.error(`User API failed: ${response.status}`);
      displayUserFallback();
      return;
    }
    const profile = await response.json();
    userProfile = profile && typeof profile === 'object' ? profile : null;
    displayUserProfile();
  } catch (error) {
    console.error('Failed to load user profile:', error);
    displayUserFallback();
  }
}

// Display user profile or fallback
function displayUserProfile() {
  if (!userProfile) {
    displayUserFallback();
    return;
  }

  const name = typeof userProfile.name === 'string' && userProfile.name.trim()
    ? userProfile.name.trim()
    : 'TaskFlow User';
  const role = typeof userProfile.role === 'string' && userProfile.role.trim()
    ? userProfile.role.trim()
    : 'Team Member';
  const imageUrl = userProfile.imageUrl;

  // Update header
  userNameEl.textContent = name;
  userRoleEl.textContent = role;
  welcomeNameEl.textContent = `${name}!`;

  userAvatarEl.replaceChildren();
  const safeImageUrl = getSafeImageUrl(imageUrl);
  if (safeImageUrl) {
    const image = document.createElement('img');
    image.src = safeImageUrl;
    image.alt = '';
    image.addEventListener('error', () => displayUserInitials(name), { once: true });
    userAvatarEl.appendChild(image);
  } else {
    displayUserInitials(name);
  }
}

// Display fallback when user info is missing
function displayUserFallback() {
  userNameEl.textContent = 'Welcome';
  userRoleEl.textContent = 'Team Member';
  welcomeNameEl.textContent = 'Your tasks, in flow.';
  displayUserInitials('User');
}

function displayUserInitials(name) {
  userAvatarEl.replaceChildren();
  userInitialsEl.textContent = getInitials(name);
  userAvatarEl.appendChild(userInitialsEl);
}

function getSafeImageUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const candidate = value.trim();
  if (candidate.startsWith('/') && !candidate.startsWith('//')) return candidate;
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

// Get initials from name
function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Load tasks from API
async function loadTasks() {
  refreshTasksBtn.disabled = true;
  retryLoadBtn.hidden = true;
  if (!hasLoadedTasks) boardStatus.textContent = 'Loading tasks...';
  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    const tasks = await response.json();
    if (!Array.isArray(tasks)) throw new Error('The task response was not a list.');
    allTasks = tasks.filter(task => task && typeof task === 'object');
    hasLoadedTasks = true;
    populateAssigneeFilter();
    applyFilters();
    boardStatus.textContent = '';
    renderBoard();
    updateSummaryCards();
  } catch (error) {
    boardStatus.textContent = `Unable to load tasks: ${error.message}`;
    retryLoadBtn.hidden = false;
    if (!hasLoadedTasks) {
      ['#total-count', '#completed-count', '#in-progress-count', '#to-do-count']
        .forEach(selector => { document.querySelector(selector).textContent = '—'; });
    }
    console.error('Error loading tasks:', error);
  } finally {
    refreshTasksBtn.disabled = false;
  }
}

// Apply active filters
function applyFilters() {
  filteredTasks = allTasks.filter(task => {
    const matchesPriority = !activeFilters.priority || String(task.priority || '').toUpperCase() === activeFilters.priority;
    const matchesStatus = !activeFilters.status || normalizeStatus(task.status) === activeFilters.status;
    const matchesAssignee = !activeFilters.assignee || String(task.assignee || '') === activeFilters.assignee;
    const searchTerm = activeFilters.search.toLowerCase();
    const matchesSearch = !searchTerm || [task.title, task.description, task.assignee]
      .some(value => String(value || '').toLowerCase().includes(searchTerm));
    return matchesPriority && matchesStatus && matchesAssignee && matchesSearch;
  });
}

// Normalize status values (backend might use different format)
function normalizeStatus(status) {
  if (typeof status !== 'string' || !status.trim()) return 'TODO';
  const upper = status.trim().toUpperCase().replace(/[\s-]+/g, '_');
  const mapping = {
    'TODO': 'TODO',
    'TO_DO': 'TODO',
    'OPEN': 'TODO',
    'IN_PROGRESS': 'IN_PROGRESS',
    'COMPLETED': 'COMPLETED',
    'DONE': 'COMPLETED',
    'ON_HOLD': 'ON_HOLD'
  };
  return mapping[upper] || 'TODO';
}

// Render Kanban board
function renderBoard() {
  const statuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];
  const statusMap = {
    'TODO': { display: 'To Do', selector: '#tasks-TODO' },
    'IN_PROGRESS': { display: 'In Progress', selector: '#tasks-IN_PROGRESS' },
    'COMPLETED': { display: 'Completed', selector: '#tasks-COMPLETED' },
    'ON_HOLD': { display: 'On Hold', selector: '#tasks-ON_HOLD' }
  };

  statuses.forEach(status => {
    const selector = statusMap[status].selector;
    const taskList = document.querySelector(selector);
    const countEl = document.querySelector(`#count-${status}`);
    const statusTasks = filteredTasks.filter(t => normalizeStatus(t.status) === status);
    
    countEl.textContent = statusTasks.length;
    taskList.replaceChildren();
    
    statusTasks.forEach(task => {
      const taskCard = createTaskCard(task);
      taskList.appendChild(taskCard);
    });
  });

  // Show/hide empty state
  if (filteredTasks.length === 0) {
    const message = allTasks.length === 0
      ? 'No tasks yet. Your task board is ready when work arrives.'
      : 'No tasks match these filters. Try changing your search or filters.';
    emptyState.querySelector('.empty-message').textContent = message;
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }
}

// Create a task card element
function createTaskCard(task) {
  const card = document.createElement('article');
  const priority = ['HIGH', 'MEDIUM', 'LOW'].includes(String(task.priority || '').toUpperCase())
    ? String(task.priority || '').toUpperCase()
    : 'LOW';
  card.className = `task-card priority-${priority}`;

  const header = document.createElement('div');
  header.className = 'task-header';
  const title = document.createElement('h4');
  title.className = 'task-title';
  title.textContent = typeof task.title === 'string' && task.title.trim() ? task.title : 'Untitled task';
  const priorityLabel = document.createElement('span');
  priorityLabel.className = `task-priority ${priority}`;
  priorityLabel.textContent = priority;
  header.append(title, priorityLabel);
  card.appendChild(header);

  if (typeof task.description === 'string' && task.description.trim()) {
    const description = document.createElement('p');
    description.className = 'task-description';
    description.textContent = task.description;
    card.appendChild(description);
  }

  const meta = document.createElement('div');
  meta.className = 'task-meta';
  const effort = document.createElement('span');
  effort.className = 'task-effort';
  effort.textContent = Number.isFinite(task.effort) ? `${task.effort}h` : 'Effort —';
  const comments = document.createElement('span');
  comments.className = 'task-comments';
  comments.textContent = `Comments ${Number.isFinite(task.comments) ? task.comments : 0}`;
  meta.append(effort, comments);
  card.appendChild(meta);

  if (typeof task.assignee === 'string' && task.assignee.trim()) {
    const assignee = document.createElement('div');
    assignee.className = 'task-assignees';
    assignee.textContent = task.assignee;
    assignee.title = task.assignee;
    card.appendChild(assignee);
  }

  return card;
}

function populateAssigneeFilter() {
  const selectedAssignee = assigneeFilter.value;
  const assignees = [...new Set(allTasks
    .map(task => typeof task.assignee === 'string' ? task.assignee.trim() : '')
    .filter(Boolean))].sort((first, second) => first.localeCompare(second));
  assigneeFilter.replaceChildren(new Option('Assignee: All', ''));
  assignees.forEach(assignee => assigneeFilter.add(new Option(assignee, assignee)));
  assigneeFilter.value = assignees.includes(selectedAssignee) ? selectedAssignee : '';
  activeFilters.assignee = assigneeFilter.value;
}

// Update summary cards
function updateSummaryCards() {
  const total = allTasks.length;
  const completed = allTasks.filter(t => normalizeStatus(t.status) === 'COMPLETED').length;
  const inProgress = allTasks.filter(t => normalizeStatus(t.status) === 'IN_PROGRESS').length;
  const toDo = allTasks.filter(t => normalizeStatus(t.status) === 'TODO').length;

  document.querySelector('#total-count').textContent = total;
  document.querySelector('#completed-count').textContent = completed;
  document.querySelector('#in-progress-count').textContent = inProgress;
  document.querySelector('#to-do-count').textContent = toDo;
}

// Attach event listeners
function attachEventListeners() {
  // Priority filter
  priorityFilter.addEventListener('change', (e) => {
    activeFilters.priority = e.target.value;
    applyFilters();
    renderBoard();
  });

  // Status filter
  statusFilter.addEventListener('change', (e) => {
    activeFilters.status = e.target.value;
    applyFilters();
    renderBoard();
  });

  assigneeFilter.addEventListener('change', (e) => {
    activeFilters.assignee = e.target.value;
    applyFilters();
    renderBoard();
  });

  // Task search
  taskSearch.addEventListener('input', (e) => {
    activeFilters.search = e.target.value;
    applyFilters();
    renderBoard();
  });

  // Clear filters
  clearFiltersBtn.addEventListener('click', () => {
    activeFilters = { priority: '', status: '', assignee: '', search: '' };
    priorityFilter.value = '';
    statusFilter.value = '';
    assigneeFilter.value = '';
    taskSearch.value = '';
    applyFilters();
    renderBoard();
  });

  // Create task button
  createTaskBtn.addEventListener('click', () => {
    alert('Create Task feature coming soon!');
  });

  refreshTasksBtn.addEventListener('click', loadTasks);
  retryLoadBtn.addEventListener('click', loadTasks);

  // Add task buttons (per column)
  document.querySelectorAll('.add-task-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const status = e.currentTarget.dataset.status;
      alert(`Add task to ${status} coming soon!`);
    });
  });

  // Global search (placeholder)
  globalSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value;
    taskSearch.value = searchTerm;
    activeFilters.search = searchTerm;
    applyFilters();
    renderBoard();
  });

  // Sidebar navigation (placeholder navigation)
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}
