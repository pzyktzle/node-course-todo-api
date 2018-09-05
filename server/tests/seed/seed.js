const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

// seed todo data
const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333
}];

// create user ids
const userOneId = new ObjectID();
const userTwoId = new ObjectID();

// seed user data
const users = [{
  _id: userOneId,
  email: 'agey@example.com',
  password: 'userOnePassword',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId.toHexString(), access: 'auth'}, 'someSecretSalt').toString()
  }]
}, {
  _id: userTwoId,
  email: 'agey@example2.com',
  password: 'userTwoPassword'
}];

// wipe database and insert todos seed data
const populateTodos = (done) => {
  Todo.deleteMany({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
};

// wipe database and insert users seed data
const populateUsers = (done) => {
  User.deleteMany({})
    .then(() => {
      // cannot use insertMany, must use save() to fire our Model.User pre('save') middleware
      var userOne = new User(users[0]).save();
      var userTwo = new User(users[1]).save();

      // Promise.all().then() only fires until all the save() promises for userOne and userTwo resolve
      return Promise.all([userOne, userTwo]);

    }).then(() => done());
};

module.exports = {
  todos,
  users,
  populateTodos,
  populateUsers
};
