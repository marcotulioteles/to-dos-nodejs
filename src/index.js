const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User not found' });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    user => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User Already exists!' });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).json(users[users.length - 1]);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { username } = request.headers;

  const userIndex = users.findIndex(user => user.username === username);

  const newToDo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  users[userIndex].todos.push(newToDo);

  return response.status(201).json(users[userIndex].todos[users[userIndex].todos.length - 1]);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  let toDo = user.todos.find(toDo => toDo.id === id);

  if (!toDo) {
    return response.status(404).json({ error: "ToDo does not exist!" });
  }

  toDo.title = title;
  toDo.deadline = new Date(deadline);

  return response.status(201).json(toDo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const toDo = user.todos.find(todo => todo.id === id);

  if (!toDo) {
    return response.status(404).json({ error: "This toDo does not exist!" });
  }

  toDo.done = true;

  return response.status(201).json(toDo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const toDoIndex = user.todos.findIndex(todo => todo.id === id);

  if (toDoIndex < 0) {
    return response.status(404).json({ error: "This toDo does not exist!" });
  }

  user.todos.splice(toDoIndex, 1);

  return response.status(204).send();
});

module.exports = app;