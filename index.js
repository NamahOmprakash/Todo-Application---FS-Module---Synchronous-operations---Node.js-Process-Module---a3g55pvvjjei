const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.txt');

// Ensure db.txt exists without failing if directory or file has edge states
function checkDbFile() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, '', 'utf8');
    }
  } catch (err) {
    // ignore
  }
}

// Helper to parse all todo items from db.txt
function getAllTodos() {
  checkDbFile();
  try {
    const raw = fs.readFileSync(dbPath, 'utf8').trim();
    if (!raw) return [];

    // Each object is a JSON block; safely split or match
    const items = raw.match(/\{[\s\S]*?\}(?=\s*\{|\s*$)/g);
    if (!items) return [];

    return items
      .map((str) => {
        try {
          return JSON.parse(str.trim());
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  } catch (err) {
    return [];
  }
}

// 1. getTodosSync
function getTodosSync() {
  checkDbFile();
  try {
    return fs.readFileSync(dbPath, 'utf8');
  } catch (err) {
    return '';
  }
}

// 2. getTodoSync
function getTodoSync(id) {
  const todos = getAllTodos();
  const todo = todos.find((t) => String(t.id) === String(id));
  return todo ? JSON.stringify(todo, null, 2) : null;
}

// 3. createTodoSync
function createTodoSync(title) {
  checkDbFile();
  const now = new Date().toISOString();

  // Accept string title or { title: '...' }
  let todoTitle = title;
  if (typeof title === 'object' && title !== null && title.title) {
    todoTitle = title.title;
  }

  const newTodo = {
    id: Date.now(),
    title: todoTitle || '',
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  const raw = fs.readFileSync(dbPath, 'utf8');
  const formatted = JSON.stringify(newTodo, null, 2);

  if (!raw || raw.trim().length === 0) {
    fs.writeFileSync(dbPath, formatted + '\n', 'utf8');
  } else {
    const prefix = raw.endsWith('\n') ? '' : '\n';
    fs.appendFileSync(dbPath, prefix + formatted + '\n', 'utf8');
  }

  return newTodo;
}

// 4. updateTodoSync
function updateTodoSync(id, updates) {
  const todos = getAllTodos();
  const index = todos.findIndex((t) => String(t.id) === String(id));

  if (index !== -1) {
    todos[index] = {
      ...todos[index],
      ...updates,
      id: todos[index].id, // preserve original id
      updatedAt: new Date().toISOString(),
    };

    const content = todos.map((t) => JSON.stringify(t, null, 2)).join('\n') + '\n';
    fs.writeFileSync(dbPath, content, 'utf8');
    return todos[index];
  }
  return null;
}

// 5. deleteTodoSync
function deleteTodoSync(id) {
  const todos = getAllTodos();
  const remaining = todos.filter((t) => String(t.id) !== String(id));

  if (remaining.length === 0) {
    fs.writeFileSync(dbPath, '', 'utf8');
  } else {
    const content = remaining.map((t) => JSON.stringify(t, null, 2)).join('\n') + '\n';
    fs.writeFileSync(dbPath, content, 'utf8');
  }
  return remaining;
}

module.exports = {
  getTodosSync,
  getTodoSync,
  createTodoSync,
  updateTodoSync,
  deleteTodoSync,
};
