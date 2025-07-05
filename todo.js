const html = document.documentElement;
const darkModeToggle = document.getElementById('darkModeToggle');
const quickAddBtn = document.getElementById('quickAddBtn');
const fab = document.getElementById('fab');
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoDate = document.getElementById('todoDate');
const todoTime = document.getElementById('todoTime');
const todoPriority = document.getElementById('todoPriority');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const progressBar = document.getElementById('progress-bar');
const progressLabel = document.getElementById('progress-label');
const toast = document.getElementById('toast');
const taskModal = document.getElementById('taskModal');
const closeTaskModal = document.getElementById('closeTaskModal');
const modalTaskTitle = document.getElementById('modalTaskTitle');
const modalTaskDate = document.getElementById('modalTaskDate');
const modalTaskPriority = document.getElementById('modalTaskPriority');
const modalCompleteBtn = document.getElementById('modalCompleteBtn');
const modalEditBtn = document.getElementById('modalEditBtn');
const modalDeleteBtn = document.getElementById('modalDeleteBtn');
const searchInput = document.getElementById('searchInput');
const settingsBtn = document.getElementById('settingsBtn');

let tasks = [];
let filter = 'all';
let editingTaskId = null;
let selectedTaskId = null;

// Theme management - matching stopwatch implementation
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  
  const icon = darkModeToggle.querySelector('.icon i');
  const text = darkModeToggle.querySelector('.toggle-text');
  
  if (isDark) {
    icon.className = 'fas fa-sun';
    text.textContent = 'Light Mode';
  } else {
    icon.className = 'fas fa-moon';
    text.textContent = 'Dark Mode';
  }
  
  showToast(`${isDark ? 'Dark' : 'Light'} mode enabled`, 'success');
}

// Initialize theme from localStorage
function loadTheme() {
  const savedTheme = localStorage.getItem('todoTheme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    const icon = darkModeToggle.querySelector('.icon i');
    const text = darkModeToggle.querySelector('.toggle-text');
    icon.className = 'fas fa-sun';
    text.textContent = 'Light Mode';
  }
}

// Save theme preference
function saveTheme() {
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('todoTheme', isDark ? 'dark' : 'light');
}

// Theme toggle event
darkModeToggle.addEventListener('click', () => {
  toggleDarkMode();
  saveTheme();
});

function saveTasks() {
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function loadTasks() {
  const data = localStorage.getItem('todoTasks');
  if (data) {
    tasks = JSON.parse(data);
  } else {
    // Sample tasks
    tasks = [
      { id: Date.now(), text: 'Welcome to your Professional To-Do App!', completed: false, date: '', time: '', priority: 'Medium' },
      { id: Date.now()+1, text: 'Try the floating add button!', completed: false, date: '', time: '', priority: 'High' },
      { id: Date.now()+2, text: 'Click a task for details.', completed: false, date: '', time: '', priority: 'Low' },
    ];
    saveTasks();
  }
}

function formatDate(date, time) {
  if (!date && !time) return '';
  let str = '';
  if (date) str += new Date(date).toLocaleDateString();
  if (time) str += ' ' + time;
  return str.trim();
}

function showToast(msg, type = 'info') {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total ? Math.round((completed/total)*100) : 0;
  progressBar.style.width = percent + '%';
  progressLabel.textContent = `${percent}% Complete`;
}

function updateEmptyState() {
  if (tasks.length === 0) {
    emptyState.classList.remove('hidden');
    todoList.classList.add('hidden');
  } else {
    emptyState.classList.add('hidden');
    todoList.classList.remove('hidden');
  }
}

function renderTasks() {
  todoList.innerHTML = '';
  let filtered = tasks;
  
  // Apply search filter
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(task => task.text.toLowerCase().includes(searchTerm));
  }
  
  // Apply status filter
  if (filter === 'completed') filtered = filtered.filter(t => t.completed);
  else if (filter === 'pending') filtered = filtered.filter(t => !t.completed);
  
  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `todo-item flex items-center justify-between mb-2 rounded shadow bg-white/80 dark:bg-gray-800/80 px-4 py-3 transition-all cursor-pointer`;
    if (task.completed) li.classList.add('completed');
    li.tabIndex = 0;
    li.setAttribute('data-id', task.id);
    li.innerHTML = `
      <div class="flex items-center gap-3">
        <input type="checkbox" class="accent-pink-500" ${task.completed ? 'checked' : ''} aria-label="Mark complete">
        <span class="todo-text font-semibold">${task.text}</span>
        <span class="todo-meta">${formatDate(task.date, task.time)}</span>
        <span class="todo-meta priority-${task.priority.toLowerCase()} px-3 py-1 rounded-full ml-2 text-xs font-bold">${task.priority}</span>
      </div>
      <div class="flex gap-2">
        <button class="todo-btn edit px-3 py-1" aria-label="Edit"><i class="fas fa-edit"></i></button>
        <button class="todo-btn delete px-3 py-1" aria-label="Delete"><i class="fas fa-trash"></i></button>
      </div>
    `;
    
    // Checkbox
    li.querySelector('input[type="checkbox"]').addEventListener('change', e => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
      updateProgress();
      showToast(task.completed ? '✅ Task completed!' : '⏳ Task marked as pending.');
    });
    
    // Edit
    li.querySelector('.edit').addEventListener('click', e => {
      e.stopPropagation();
      openEditModal(task);
    });
    
    // Delete
    li.querySelector('.delete').addEventListener('click', e => {
      e.stopPropagation();
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
      updateProgress();
      showToast('🗑️ Task deleted.');
    });
    
    // Open details modal
    li.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'I' || e.target.tagName === 'INPUT') return;
      openTaskModal(task);
    });
    
    todoList.appendChild(li);
  });
  updateEmptyState();
  updateProgress();
}

function openAddForm() {
  todoForm.classList.remove('hidden');
  todoInput.focus();
}

function closeAddForm() {
  todoForm.classList.add('hidden');
  todoForm.reset();
}

quickAddBtn.addEventListener('click', openAddForm);
fab.addEventListener('click', openAddForm);

todoForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = todoInput.value.trim();
  const date = todoDate.value;
  const time = todoTime.value;
  const priority = todoPriority.value;
  if (!text) return;
  
  tasks.unshift({ id: Date.now(), text, completed: false, date, time, priority });
  saveTasks();
  renderTasks();
  updateProgress();
  showToast('✨ Task added!');
  closeAddForm();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAddForm();
});

todoForm.addEventListener('reset', closeAddForm);

function openTaskModal(task) {
  selectedTaskId = task.id;
  modalTaskTitle.textContent = task.text;
  modalTaskDate.textContent = formatDate(task.date, task.time);
  modalTaskPriority.textContent = task.priority;
  modalTaskPriority.className = `inline-block px-3 py-1 rounded-full text-xs font-semibold priority-${task.priority.toLowerCase()}`;
  taskModal.classList.remove('hidden');
}

function closeTaskModalFn() {
  taskModal.classList.add('hidden');
  selectedTaskId = null;
}

closeTaskModal.addEventListener('click', closeTaskModalFn);
taskModal.addEventListener('click', e => {
  if (e.target === taskModal) closeTaskModalFn();
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeTaskModalFn();
});

modalCompleteBtn.addEventListener('click', () => {
  const task = tasks.find(t => t.id === selectedTaskId);
  if (task) {
    task.completed = true;
    saveTasks();
    renderTasks();
    updateProgress();
    showToast('✅ Task completed!');
    closeTaskModalFn();
  }
});

modalEditBtn.addEventListener('click', () => {
  const task = tasks.find(t => t.id === selectedTaskId);
  if (task) {
    closeTaskModalFn();
    openEditModal(task);
  }
});

modalDeleteBtn.addEventListener('click', () => {
  const task = tasks.find(t => t.id === selectedTaskId);
  if (task) {
    tasks = tasks.filter(t => t.id !== task.id);
    saveTasks();
    renderTasks();
    updateProgress();
    showToast('🗑️ Task deleted.');
    closeTaskModalFn();
  }
});

function openEditModal(task) {
  editingTaskId = task.id;
  todoInput.value = task.text;
  todoDate.value = task.date;
  todoTime.value = task.time;
  todoPriority.value = task.priority;
  openAddForm();
  
  // Change form submit behavior to update instead of add
  const originalSubmitHandler = todoForm.onsubmit;
  todoForm.onsubmit = function(e) {
    e.preventDefault();
    const text = todoInput.value.trim();
    const date = todoDate.value;
    const time = todoTime.value;
    const priority = todoPriority.value;
    if (!text) return;
    
    const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], text, date, time, priority };
      saveTasks();
      renderTasks();
      showToast('✏️ Task updated!');
      closeAddForm();
      editingTaskId = null;
      todoForm.onsubmit = originalSubmitHandler;
    }
  };
}

// Search functionality
searchInput.addEventListener('input', () => {
  renderTasks();
});

// Settings button (placeholder functionality)
settingsBtn.addEventListener('click', () => {
  showToast('⚙️ Settings feature coming soon!');
});

// Initialize the app
loadTheme();
loadTasks();
renderTasks();
updateProgress();

document.querySelectorAll('.todo-btn.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.todo-btn.filter').forEach(b => b.classList.remove('selected-filter'));
    btn.classList.add('selected-filter');
    filter = btn.dataset.filter;
    renderTasks();
  });
}); 