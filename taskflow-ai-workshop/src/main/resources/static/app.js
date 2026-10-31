// State management
let allTasks = [];
let filteredTasks = [];
let userProfile = null;
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
  await Promise.all([
    loadUserProfile(),
    loadTasks()
  ]);
  attachEventListeners();
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
    userProfile = await response.json();
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

  const name = userProfile.name || 'Taskflow User';
  const role = userProfile.role || 'Team Member';
  const imageUrl = userProfile.imageUrl;

  // Update header
  userNameEl.textContent = name;
  userRoleEl.textContent = role;
  welcomeNameEl.textContent = name;

  // Set avatar
  if (imageUrl) {
    // If imageUrl is available, create an img element
    userAvatarEl.innerHTML = `<img src="${imageUrl}" alt="${name}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
  } else {
    // Fall back to initials
    const initials = getInitials(name);
    userInitialsEl.textContent = initials;
  }
}

// Display fallback when user info is missing
function displayUserFallback() {
  userNameEl.textContent = 'Welcome';
  userRoleEl.textContent = 'Team Member';
  welcomeNameEl.textContent = 'Taskflow User!';
  userInitialsEl.textContent = 'U';
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
  try {
    boardStatus.textContent = 'Loading board...';
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    allTasks = await response.json();
    applyFilters();
    boardStatus.textContent = '';
    renderBoard();
    updateSummaryCards();
  } catch (error) {
    boardStatus.textContent = `Unable to load tasks: ${error.message}`;
    console.error('Error loading tasks:', error);
  }
}

// Apply active filters
function applyFilters() {
  filteredTasks = allTasks.filter(task => {
    const matchesPriority = !activeFilters.priority || task.priority === activeFilters.priority;
    const matchesStatus = !activeFilters.status || normalizeStatus(task.status) === activeFilters.status;
    const matchesSearch = !activeFilters.search || 
      task.title.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(activeFilters.search.toLowerCase()));
    return matchesPriority && matchesStatus && matchesSearch;
  });
}

// Normalize status values (backend might use different format)
function normalizeStatus(status) {
  if (!status) return 'TODO';
  const upper = status.toUpperCase().replace(' ', '_');
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
    taskList.innerHTML = '';
    
    statusTasks.forEach(task => {
      const taskCard = createTaskCard(task);
      taskList.appendChild(taskCard);
    });
  });

  // Show/hide empty state
  if (filteredTasks.length === 0 && allTasks.length > 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }
}

// Create a task card element
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = `task-card priority-${task.priority || 'LOW'}`;
  
  const priority = task.priority || 'LOW';
  const effort = task.effort || '—';
  const commentCount = task.comments || 0;
  
  let assigneesHtml = '';
  if (task.assignee) {
    const initials = getInitials(task.assignee);
    assigneesHtml = `<div class="assignee-avatar" title="${task.assignee}">${initials}</div>`;
  }

  card.innerHTML = `
    <div class="task-header">
      <h4 class="task-title">${escapeHtml(task.title)}</h4>
      <span class="task-priority ${priority}">${priority}</span>
    </div>
    ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
    <div class="task-meta">
      <span class="task-effort">⏱️ ${effort}h</span>
      <span class="task-comments">💬 ${commentCount}</span>
    </div>
    ${assigneesHtml ? `<div class="task-assignees">${assigneesHtml}</div>` : ''}
  `;
  
  return card;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

  // Add task buttons (per column)
  document.querySelectorAll('.add-task-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const status = e.target.dataset.status;
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
