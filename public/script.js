document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const taskStatus = document.getElementById('taskStatus');
  const editingTaskId = document.getElementById('editingTaskId');
  const taskTable = document.getElementById('taskTable');

  let tasks = [];

  // Charger les tâches
  fetch('/tasks')
    .then(res => res.json())
    .then(data => {
      tasks = data;
      taskTable.innerHTML = '';
      tasks.forEach(addTaskToDOM);
    });

  // Soumission du formulaire
  taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = taskInput.value.trim();
    const done = taskStatus.value === 'true';

    if (!text) return;

    const id = editingTaskId.value;

    if (id) {
      // Modifier une tâche
      fetch(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, done })
      })
        .then(res => res.json())
        .then(updatedTask => {
          tasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
          resetForm();
          renderTasks();
        });
    } else {
      // Ajouter une tâche
      fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, done })
      })
        .then(res => res.json())
        .then(newTask => {
          tasks.push(newTask);
          addTaskToDOM(newTask);
          resetForm();
        });
    }
  });

  function addTaskToDOM(task) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', task.id);
    tr.innerHTML = `
      <td class="px-6 py-3">${task.text}</td>
      <td class="px-6 py-3">${task.done ? 'Faite' : 'Non faite'}</td>
      <td class="px-6 py-3">
        <button class="text-red-500 hover:text-red-700" onclick="deleteTask(${task.id})">Supprimer</button>
        <button class="text-blue-500 hover:text-blue-700 ml-2" onclick="editTask(${task.id})">Modifier</button>
      </td>
    `;
    taskTable.appendChild(tr);
  }

  function renderTasks() {
    taskTable.innerHTML = '';
    tasks.forEach(addTaskToDOM);
  }

  function resetForm() {
    taskInput.value = '';
    taskStatus.value = 'false';
    editingTaskId.value = '';
  }

  window.deleteTask = (id) => {
    fetch(`/tasks/${id}`, { method: 'DELETE' })
      .then(() => {
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
      });
  };

  window.editTask = (id) => {
    const task = tasks.find(t => t.id === id);
    taskInput.value = task.text;
    taskStatus.value = task.done ? 'true' : 'false';
    editingTaskId.value = task.id;
  };
});
