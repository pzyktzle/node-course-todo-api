const {ObjectID} = require('mongodb');
const mongoose = require('./../server/db/mongoose');

const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// var id = '5b8a4320ecbc1f0bd4cf72611';
//
// if (!ObjectID.isValid(id)) {
//     console.log('ID is not valid');
// }

// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('Todos', JSON.stringify(todos, undefined, 2));
// });
//
// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('Todo', JSON.stringify(todo, undefined, 2));
// });

// Todo.findById(id).then((todo) => {
//   if (!todo) {
//     return console.log('Id not found');
//   }
//   console.log('Todo by id', JSON.stringify(todo, undefined, 2));
// }).catch((e) => console.log(e));

var userId = '5b89346dcb2f230bb85f1103';

if (!ObjectID.isValid(userId)) {
  console.log('Invalid users Id');
} else {
  User.findById(userId).then((user) => {
    if (!user) {
      return console.log('No user found');
    }
    console.log('User', JSON.stringify(user, undefined, 2));
  }).catch((e) => console.log(e));
}
