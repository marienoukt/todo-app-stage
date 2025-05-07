const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let tasks = [];
try {
  const data = fs.readFileSync('./tasks.json');
  tasks = JSON.parse(data);
} catch (err) {
  console.log('Aucune tâche enregistrée. Initialisation avec une liste vide.');
}

// GET - Récupérer toutes les tâches
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// POST - Ajouter une nouvelle tâche
app.post('/tasks', (req, res) => {
  const { text, done } = req.body;
  const newTask = { id: Date.now(), text, done };
  tasks.push(newTask);
  fs.writeFileSync('./tasks.json', JSON.stringify(tasks, null, 2));
  res.status(201).json(newTask);
});

// DELETE - Supprimer une tâche
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter(t => t.id !== id);
  fs.writeFileSync('./tasks.json', JSON.stringify(tasks, null, 2));
  res.status(204).send();
});

// PUT - Modifier une tâche
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { text, done } = req.body;
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).send();

  task.text = text;
  task.done = done;
  fs.writeFileSync('./tasks.json', JSON.stringify(tasks, null, 2));
  res.json(task);
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
