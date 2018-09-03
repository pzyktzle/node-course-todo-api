const express = require('express');
const bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongoose');

const {Todo} = require('./models/todo');
const {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

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
// GET /todos/id
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
// DELETE /todos/id
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

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
