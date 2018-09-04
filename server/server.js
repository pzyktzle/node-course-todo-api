require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongoose');

const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

//
// GET /todos
//
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

//
// GET /todos/:id
//
app.get('/todos/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(404).send({error: 'Invalid Id'});
  } else {
    Todo.findById(id).then((todo) => {
      if (!todo) {
        res.status(404).send({error: 'Id not found'});
      }
      res.status(200).send({todo});
    }).catch((e) => res.status(400).send());
  }
});

//
// POST /todos
//
app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((todo) => {
    res.send({todo});
  }, (e) => {
    res.status(400).send(e);
  });
});

//
// DELETE /todos/:id
//
app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    res.status(404).send({error: 'Invalid id'});
  }
  Todo.findByIdAndDelete(id).then((todo) => {
    if (!todo) {
      res.status(404).send({error: 'Id not found'});
    }
    res.status(200).send({todo});
  }).catch((e) => res.status(400).send());
});

//
// PATCH /todos/:id
//
app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    res.status(404).send({error: 'Invalid id'});
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = Date.now();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      res.status(404).send({error: 'Id not found'});
    }
    res.status(200).send({todo});
  }).catch((e) => res.status(400).send());
});

//
// POST /users
//
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send({user});
  }).catch((e) => {
    res.status(400).send(e);
  });


});

//
// GET /users/me
//
app.get('/users/me', authenticate, (req, res) => {
  //var user = req.user;
  res.send({user: req.user}); // won't send res.send({req.user}) for some reason
});

//
// finish up
//
app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
