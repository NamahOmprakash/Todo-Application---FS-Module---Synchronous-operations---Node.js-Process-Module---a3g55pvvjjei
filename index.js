const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.txt');

const readTodos = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '', 'utf8');
    return [];
  }
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
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '', 'utf8');
  }
  return fs.readFileSync(dbPath, 'utf8');
};

const getTodoSync = (id) => {
  const todos = readTodos();
  const todo = todos.find((item) => String(item.id) === String(id));
  return todo ? JSON.stringify(todo, null, 2) : null;
};

const createTodoSync = (todo) => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '', 'utf8');
  }
  const now = new Date().toISOString();
  const title = typeof todo === 'object' && todo !== null ? todo.title : todo;

  const newTodo = {
    id: Date.now(),
    title: title,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  const formatted = JSON.stringify(newTodo, null, 2) + '\n';
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
