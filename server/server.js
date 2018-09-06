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
app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

//
// GET /todos/:id
//
app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(404).send({error: 'Invalid Id'});
  } else {
    Todo.findOne({
      _id: id,
      _creator: req.user._id
    }).then((todo) => {
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
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
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
app.delete('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    res.status(404).send({error: 'Invalid id'});
  }

  Todo.findOneAndDelete({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      res.status(404).send({error: 'Id not found'});
    }
    res.status(200).send({todo});
  }).catch((e) => res.status(400).send());
});

//
// PATCH /todos/:id
//
app.patch('/todos/:id', authenticate, (req, res) => {
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

  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
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
    res.status(200).header('x-auth', token).send({user});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

//
// GET /users/me
//
app.get('/users/me', authenticate, (req, res) => {
  res.send({user: req.user});
});

//
// POST /users/login
//
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.status(200).header('x-auth', token).send({user});
    });
  }).catch((e) => {
    res.status(400).send({error: 'bad email or password'})
  });
});

//
// DELETE /users/me/token
//
app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send({message: 'logout successful'});
  }, () => {
    res.status(400).send({error: 'logout failed: token not removed'});
  });
});

//
// finish up
//
app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
