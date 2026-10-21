const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.txt');

const ensureDbExists = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '', 'utf8');
  }
};

const readTodos = () => {
  ensureDbExists();
  const data = fs.readFileSync(dbPath, 'utf8').trim();
  if (!data) return [];
  const matches = data.match(/\{[\s\S]*?\}/g);
  if (!matches) return [];
  return matches.map((item) => JSON.parse(item));
};

const writeTodos = (todos) => {
  if (!todos || todos.length === 0) {
    fs.writeFileSync(dbPath, '', 'utf8');
    return;
  }
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

  let title = todo;
  if (typeof todo === 'object' && todo !== null && todo.title) {
    title = todo.title;
  }

  const newTodo = {
    id: Date.now(),
    title: title || '',
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  const rawData = fs.readFileSync(dbPath, 'utf8');
  let formatted = JSON.stringify(newTodo, null, 2) + '\n';
  if (rawData.length > 0 && !rawData.endsWith('\n')) {
    formatted = '\n' + formatted;
  }

  fs.appendFileSync(dbPath, formatted, 'utf8');
  return newTodo;
};

const updateTodoSync = (id, updates) => {
  const todos = readTodos();
  const index = todos.findIndex((item) => String(item.id) === String(id));

  if (index !== -1) {
    todos[index] = Object.assign({}, todos[index], updates, {
      id: todos[index].id,
      updatedAt: new Date().toISOString(),
    });
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
