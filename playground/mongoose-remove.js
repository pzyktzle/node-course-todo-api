const {ObjectID} = require('mongodb');
const mongoose = require('./../server/db/mongoose');

const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');


// Todo.deleteMany({}).then((result) => {
//   console.log(result);
// });

// // note: mongoose's Model.findOneAndDelete doesn't need new ObjectID('xxx')
// Todo.findOneAndDelete({_id: '5b8ca0caf2d02fde3d6af111'}).then((todo) => {
//   console.log(todo);
// });

// Todo.findByIdAndDelete('5b8c9f6cf2d02fde3d6af0df').then((todo) => {
//   console.log(todo);
// });
