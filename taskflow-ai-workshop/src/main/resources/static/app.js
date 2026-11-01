// State management
let allTasks = [];
let filteredTasks = [];
let userProfile = null;
let profileFailedImageUrl = '';
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
const boardStatus = document.querySelector('#board-status');
const emptyState = document.querySelector('#empty-state');
const emptyMessage = document.querySelector('#empty-message');
const unmappedStatusNote = document.querySelector('#unmapped-status-note');
const userNameEl = document.querySelector('#user-name');
const userRoleEl = document.querySelector('#user-role');
const userImageEl = document.querySelector('#user-image');
const userInitialsEl = document.querySelector('#user-initials');
const welcomeGreetingEl = document.querySelector('#welcome-greeting');
const welcomeNameEl = document.querySelector('#welcome-name');
const profileStatus = document.querySelector('#profile-status');

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
      throw new Error(`Request failed (${response.status})`);
    }
    const profile = await response.json();
    userProfile = profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : {};
  } catch (error) {
    console.error('Failed to load user profile:', error);
    userProfile = null;
    profileStatus.textContent = 'Unable to load configured profile.';
    profileStatus.hidden = false;
  }
  displayUserProfile();
}

function displayUserProfile() {
  const profile = userProfile || {};
  const rawName = typeof profile.name === 'string' ? profile.name.trim() : '';
  const rawRole = typeof profile.role === 'string' ? profile.role.trim() : '';
  const name = /^(null|undefined)$/i.test(rawName) ? '' : rawName;
  const role = /^(null|undefined)$/i.test(rawRole) ? '' : rawRole;

  userNameEl.textContent = name;
  userNameEl.hidden = !name;
  userRoleEl.textContent = role;
  userRoleEl.hidden = !role;
  welcomeGreetingEl.textContent = name ? 'Welcome back,' : 'Welcome to UVJTaskFlow';
  welcomeNameEl.textContent = name;
  welcomeNameEl.hidden = !name;
  userInitialsEl.textContent = name ? getInitials(name) : 'U';

  const rawImageUrl = typeof profile.imageUrl === 'string' ? profile.imageUrl.trim() : '';
  let imageUrl = '';
  if (rawImageUrl && rawImageUrl !== profileFailedImageUrl) {
    try {
      const parsed = new URL(rawImageUrl, window.location.origin);
      if (!rawImageUrl.startsWith('//') && (parsed.protocol === 'http:' || parsed.protocol === 'https:')) {
        imageUrl = parsed.href;
      }
    } catch {
      imageUrl = '';
    }
  }

  userImageEl.hidden = !imageUrl;
  userInitialsEl.hidden = Boolean(imageUrl);
  userImageEl.alt = name ? `Profile image for ${name}` : 'User profile image';
  userImageEl.onerror = () => {
    profileFailedImageUrl = imageUrl;
    userImageEl.removeAttribute('src');
    userImageEl.hidden = true;
    userInitialsEl.hidden = false;
  };
  if (imageUrl && userImageEl.src !== imageUrl) userImageEl.src = imageUrl;
}

function getInitials(name) {
  const parts = typeof name === 'string' ? name.trim().split(/\s+/).filter(Boolean) : [];
  if (parts.length === 0) return 'U';
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

// Load tasks from API
async function loadTasks() {
  try {
    boardStatus.textContent = 'Loading board...';
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    const tasks = await response.json();
    if (!Array.isArray(tasks)) {
      throw new Error('The task service returned an invalid response.');
    }
    allTasks = tasks;
    populateAssigneeFilter();
    applyFilters();
    boardStatus.textContent = '';
    renderBoard();
    updateSummaryCards();
  } catch (error) {
    boardStatus.textContent = `Unable to load tasks: ${error.message}`;
    console.error('Error loading tasks:', error);
  }
}

function applyFilters() {
  const query = activeFilters.search.trim().toLowerCase();
  filteredTasks = allTasks.filter((task) => {
    const matchesPriority = !activeFilters.priority || task.priority === activeFilters.priority;
    const matchesStatus = !activeFilters.status || normalizeStatus(task.status) === activeFilters.status;
    const matchesAssignee = !activeFilters.assignee || task.assignee === activeFilters.assignee;
    const matchesSearch = !query || [task.title, task.description, task.status, task.priority, task.assignee]
      .some((value) => typeof value === 'string' && value.toLowerCase().includes(query));
    return matchesPriority && matchesStatus && matchesAssignee && matchesSearch;
  });
}

function normalizeStatus(status) {
  if (typeof status !== 'string' || !status.trim()) return '';
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
  return mapping[upper] || upper;
}

function populateAssigneeFilter() {
  const selectedAssignee = activeFilters.assignee;
  assigneeFilter.replaceChildren(new Option('Assignee: All', ''));
  const assignees = [...new Set(allTasks
    .map((task) => typeof task.assignee === 'string' ? task.assignee.trim() : '')
    .filter(Boolean))].sort((left, right) => left.localeCompare(right));
  for (const assignee of assignees) {
    assigneeFilter.add(new Option(assignee, assignee));
  }
  if (assignees.includes(selectedAssignee)) assigneeFilter.value = selectedAssignee;
  else activeFilters.assignee = '';
}

function renderBoard() {
  const statuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];
  const statusMap = {
    'TODO': '#tasks-TODO',
    'IN_PROGRESS': '#tasks-IN_PROGRESS',
    'COMPLETED': '#tasks-COMPLETED',
    'ON_HOLD': '#tasks-ON_HOLD'
  };

  statuses.forEach((status) => {
    const taskList = document.querySelector(statusMap[status]);
    const countEl = document.querySelector(`#count-${status}`);
    const statusTasks = filteredTasks.filter((task) => normalizeStatus(task.status) === status);
    
    countEl.textContent = statusTasks.length;
    taskList.replaceChildren();
    
    statusTasks.forEach((task) => {
      const taskCard = createTaskCard(task);
      taskList.appendChild(taskCard);
    });
  });

  const unmappedCount = filteredTasks.filter((task) => !statuses.includes(normalizeStatus(task.status))).length;
  unmappedStatusNote.hidden = unmappedCount === 0;
  unmappedStatusNote.textContent = unmappedCount
    ? `${unmappedCount} task${unmappedCount === 1 ? ' has' : 's have'} a status that is not represented on this board.`
    : '';

  emptyState.classList.toggle('hidden', filteredTasks.length > 0);
  emptyMessage.textContent = allTasks.length === 0
    ? 'No tasks have been returned yet.'
    : 'No tasks match the selected filters.';
}

function createTaskCard(task) {
  const priorityValue = typeof task.priority === 'string' ? task.priority.trim().toUpperCase() : '';
  const priority = ['HIGH', 'MEDIUM', 'LOW'].includes(priorityValue) ? priorityValue : '';
  const card = document.createElement('article');
  card.className = `task-card${priority ? ` priority-${priority}` : ''}`;

  const header = document.createElement('div');
  header.className = 'task-header';
  const title = document.createElement('h4');
  title.className = 'task-title';
  title.textContent = typeof task.title === 'string' && task.title.trim() ? task.title : 'Untitled task';
  header.appendChild(title);

  const priorityBadge = document.createElement('span');
  priorityBadge.className = `task-priority${priority ? ` ${priority}` : ''}`;
  priorityBadge.textContent = priority || 'Priority not set';
  header.appendChild(priorityBadge);
  card.appendChild(header);

  if (typeof task.description === 'string' && task.description.trim()) {
    const description = document.createElement('p');
    description.className = 'task-description';
    description.textContent = task.description;
    card.appendChild(description);
  }

  if (typeof task.jiraIssueKey === 'string' && task.jiraIssueKey.trim()) {
    const issueKey = document.createElement('p');
    issueKey.className = 'task-issue-key';
    issueKey.textContent = task.jiraIssueKey;
    card.appendChild(issueKey);
  }

  const metadata = document.createElement('div');
  metadata.className = 'task-meta';
  const effort = document.createElement('span');
  effort.className = 'task-effort';
  effort.textContent = task.effort == null ? 'Effort: —' : `Effort: ${task.effort}h`;
  metadata.appendChild(effort);
  if (Number.isFinite(task.comments)) {
    const comments = document.createElement('span');
    comments.className = 'task-comments';
    comments.textContent = `Comments: ${task.comments}`;
    metadata.appendChild(comments);
  }
  card.appendChild(metadata);

  if (typeof task.assignee === 'string' && task.assignee.trim()) {
    const assignee = document.createElement('div');
    assignee.className = 'task-assignees';
    const avatar = document.createElement('span');
    avatar.className = 'assignee-avatar';
    avatar.title = task.assignee;
    avatar.textContent = getInitials(task.assignee);
    assignee.appendChild(avatar);
    card.appendChild(assignee);
  }

  return card;
}

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
    globalSearch.value = '';
    priorityFilter.value = '';
    statusFilter.value = '';
    assigneeFilter.value = '';
    taskSearch.value = '';
    applyFilters();
    renderBoard();
  });

  // Keep the global and board search controls synchronized.
  globalSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value;
    taskSearch.value = searchTerm;
    activeFilters.search = searchTerm;
    applyFilters();
    renderBoard();
  });

  const navItems = document.querySelectorAll('.nav-item');
  const updateActiveNavigation = () => {
    const currentTarget = window.location.hash || '#dashboard-section';
    navItems.forEach((item) => {
      const active = item.getAttribute('href') === currentTarget;
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  };
  window.addEventListener('hashchange', updateActiveNavigation);
  updateActiveNavigation();
}
