document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const taskInput = document.querySelector('.task-input');
  const dateInput = document.querySelector('.date-input');
  const addBtn = document.querySelector('.add-btn');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const taskList = document.querySelector('.task-list');
  
  // Set minimum date as today
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1;
  let dd = today.getDate();
  
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  
  const formattedToday = `${yyyy}-${mm}-${dd}`;
  dateInput.min = formattedToday;
  dateInput.value = formattedToday;
  
  // Tasks array
  let tasks = JSON.parse(localStorage.getItem('minimalist-tasks')) || [];
  
  // Render tasks based on filter
  function renderTasks(filter = 'all') {
      taskList.innerHTML = '';
      
      if (tasks.length === 0) {
          taskList.innerHTML = `
              <div class="empty-state">
                  <i class="fas fa-clipboard-list"></i>
                  <p>No tasks yet</p>
              </div>
          `;
          return;
      }
      
      let filteredTasks = tasks;
      
      if (filter === 'active') {
          filteredTasks = tasks.filter(task => !task.completed && !isOverdue(task.date));
      } else if (filter === 'completed') {
          filteredTasks = tasks.filter(task => task.completed);
      } else if (filter === 'overdue') {
          filteredTasks = tasks.filter(task => !task.completed && isOverdue(task.date));
      }
      
      if (filteredTasks.length === 0) {
          taskList.innerHTML = `
              <div class="empty-state">
                  <i class="fas fa-search"></i>
                  <p>No tasks match your filter</p>
              </div>
          `;
          return;
      }
      
      filteredTasks.forEach((task, index) => {
          const taskItem = document.createElement('li');
          taskItem.classList.add('task-item');
          
          if (task.completed) {
              taskItem.classList.add('completed');
          } else if (isOverdue(task.date)) {
              taskItem.classList.add('overdue');
          }
          
          const taskDate = new Date(task.date);
          const formattedDate = taskDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
          });
          
          taskItem.innerHTML = `
              <div class="task-content">
                  <div class="task-text">${task.text}</div>
                  <div class="task-date"><i class="far fa-calendar"></i> ${formattedDate}</div>
              </div>
              <div class="task-actions">
                  <button class="action-btn complete-btn"><i class="fas fa-check"></i></button>
                  <button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
              </div>
          `;
          
          // Add event listeners
          const completeBtn = taskItem.querySelector('.complete-btn');
          completeBtn.addEventListener('click', () => toggleComplete(index));
          
          const deleteBtn = taskItem.querySelector('.delete-btn');
          deleteBtn.addEventListener('click', () => deleteTask(index));
          
          taskList.appendChild(taskItem);
      });
  }
  
  // Check if a task is overdue
  function isOverdue(dateString) {
      const taskDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return taskDate < today;
  }
  
  // Add new task
  function addTask() {
      const text = taskInput.value.trim();
      const date = dateInput.value;
      
      if (text === '') {
          alert('Please enter a task!');
          return;
      }
      
      tasks.push({
          text,
          date,
          completed: false
      });
      
      saveTasks();
      renderTasks(getActiveFilter());
      
      // Reset input
      taskInput.value = '';
      dateInput.value = formattedToday;
      taskInput.focus();
  }
  
  // Toggle task completion
  function toggleComplete(index) {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks(getActiveFilter());
  }
  
  // Delete task
  function deleteTask(index) {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks(getActiveFilter());
  }
  
  // Save tasks to localStorage
  function saveTasks() {
      localStorage.setItem('minimalist-tasks', JSON.stringify(tasks));
  }
  
  // Get active filter
  function getActiveFilter() {
      const activeFilter = document.querySelector('.filter-btn.active');
      return activeFilter.dataset.filter;
  }
  
  // Event listeners
  addBtn.addEventListener('click', addTask);
  
  taskInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          addTask();
      }
  });
  
  filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
          // Remove active class from all buttons
          filterBtns.forEach(b => b.classList.remove('active'));
          // Add active class to clicked button
          this.classList.add('active');
          // Render tasks with the selected filter
          renderTasks(this.dataset.filter);
      });
  });
  
  // Initial render
  renderTasks();
});