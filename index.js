const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.txt');

// Ensure db.txt exists only inside functions
function ensureDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '', 'utf8');
  }
}

// Read all todos as objects
function readAllTodos() {
  ensureDb();
  const content = fs.readFileSync(dbPath, 'utf8').trim();
  if (!content) return [];

  // Match each JSON object block { ... }
  const matches = content.match(/\{[\s\S]*?\}(?=\s*\{|\s*$)/g);
  if (!matches) return [];

  const list = [];
  for (const m of matches) {
    try {
      list.push(JSON.parse(m.trim()));
    } catch (err) {
      // ignore malformed items if any
    }
  }
  return list;
}

// Overwrite db.txt with the given array of todos
function writeAllTodos(todos) {
  ensureDb();
  if (!todos || todos.length === 0) {
    fs.writeFileSync(dbPath, '', 'utf8');
    return;
  }
  const formatted = todos.map((t) => JSON.stringify(t, null, 2)).join('\n');
  fs.writeFileSync(dbPath, formatted + '\n', 'utf8');
}

// 1. getTodosSync
function getTodosSync() {
  ensureDb();
  return fs.readFileSync(dbPath, 'utf8');
}

// 2. getTodoSync
function getTodoSync(id) {
  const todos = readAllTodos();
  const todo = todos.find((t) => String(t.id) === String(id));
  return todo ? JSON.stringify(todo, null, 2) : null;
}

// 3. createTodoSync
function createTodoSync(todoInput) {
  ensureDb();
  const now = new Date().toISOString();

  let title = '';
  if (typeof todoInput === 'string') {
    title = todoInput;
  } else if (todoInput && typeof todoInput === 'object') {
    title = todoInput.title || '';
  }

  const newTodo = {
    id: Date.now(),
    title: title,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  const raw = fs.readFileSync(dbPath, 'utf8');
  const formatted = JSON.stringify(newTodo, null, 2);

  if (!raw || raw.trim().length === 0) {
    fs.writeFileSync(dbPath, formatted + '\n', 'utf8');
  } else {
    const separator = raw.endsWith('\n') ? '' : '\n';
    fs.appendFileSync(dbPath, separator + formatted + '\n', 'utf8');
  }

  return newTodo;
}

// 4. updateTodoSync
function updateTodoSync(id, updates) {
  const todos = readAllTodos();
  const index = todos.findIndex((t) => String(t.id) === String(id));

  if (index !== -1) {
    todos[index] = {
      ...todos[index],
      ...updates,
      id: todos[index].id,
      updatedAt: new Date().toISOString(),
    };
    writeAllTodos(todos);
    return todos[index];
  }
  return null;
}

// 5. deleteTodoSync
function deleteTodoSync(id) {
  const todos = readAllTodos();
  const remaining = todos.filter((t) => String(t.id) !== String(id));
  writeAllTodos(remaining);
  return remaining;
}

module.exports = {
  getTodosSync,
  getTodoSync,
  createTodoSync,
  updateTodoSync,
  deleteTodoSync,
};
