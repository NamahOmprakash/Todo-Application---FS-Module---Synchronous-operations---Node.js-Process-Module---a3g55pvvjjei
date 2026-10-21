const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.txt');

// Helper to ensure db.txt exists
const ensureDbExists = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '', 'utf8');
  }
};

// Helper to parse all JSON objects from db.txt
const readTodos = () => {
  ensureDbExists();
  const data = fs.readFileSync(dbPath, 'utf8').trim();
  if (!data) return [];

  // Match each JSON object { ... }
  const matches = data.match(/\{[\s\S]*?\}(?=\s*\{|\s*$)/g);
  if (!matches) return [];

  return matches.map((item) => JSON.parse(item));
};

// Helper to rewrite all todos to db.txt
const writeTodos = (todos) => {
  if (!todos || todos.length === 0) {
    fs.writeFileSync(dbPath, '', 'utf8');
    return;
  }
  // Join objects by newline as specified in the problem statement
  const content = todos.map((item) => JSON.stringify(item, null, 2)).join('\n') + '\n';
  fs.writeFileSync(dbPath, content, 'utf8');
};

const getTodosSync = () => {
  ensureDbExists();
  return fs.readFileSync(dbPath, 'utf8');
};

const getTodoSync = (id) => {
  const todos = readTodos();
  const todo = todos.find((item) => String(item.id) === String(id));
  return todo ? JSON.stringify(todo, null, 2) : null;
};

const createTodoSync = (todo) => {
  ensureDbExists();
  const now = new Date().toISOString();

  let title = '';
  if (typeof todo === 'string') {
    title = todo;
  } else if (todo && typeof todo === 'object') {
    title = todo.title || '';
  }

  const newTodo = {
    id: Date.now(),
    title: title,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  const currentContent = fs.readFileSync(dbPath, 'utf8');
  const formattedTodo = JSON.stringify(newTodo, null, 2);

  let toAppend = '';
  if (currentContent.length === 0) {
    toAppend = formattedTodo + '\n';
  } else if (currentContent.endsWith('\n')) {
    toAppend = formattedTodo + '\n';
  } else {
    toAppend = '\n' + formattedTodo + '\n';
  }

  fs.appendFileSync(dbPath, toAppend, 'utf8');
  return newTodo;
};

const updateTodoSync = (id, updates) => {
  const todos = readTodos();
  const index = todos.findIndex((item) => String(item.id) === String(id));

  if (index !== -1) {
    todos[index] = {
      ...todos[index],
      ...updates,
      id: todos[index].id, // Ensure ID is never overwritten
      updatedAt: new Date().toISOString(),
    };

    writeTodos(todos);
    return todos[index];
  }
  return null;
};

const deleteTodoSync = (id) => {
  const todos = readTodos();
  const remaining = todos.filter((item) => String(item.id) !== String(id));
  writeTodos(remaining);
};

module.exports = {
  getTodosSync,
  getTodoSync,
  createTodoSync,
  updateTodoSync,
  deleteTodoSync,
};
