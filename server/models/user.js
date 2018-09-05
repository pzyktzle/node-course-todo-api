const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minLength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: (value) => {
        return validator.isEmail(value);
      },
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

//
// Schema.methods stores instance methods for a schema (var user = new User(data))
// arrow functions do not bind a 'this' keyword so function () {} is required
//
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'someSecretSalt').toString();

  // user.tokens.push({access, token});
  user.tokens = user.tokens.concat([{access, token}]);

  // return "user.save().then" promise unfired and requiring then() to be called before returning token
  return user.save().then(() => {
    return token;
  });
};

//
// UserSchema.statics stores model methods for a schema (User.someMethod())
//
UserSchema.statics.findByToken = function (token) {
  var User = this; // binds to the whole collection
  var decoded;

  try {
    decoded = jwt.verify(token, 'someSecretSalt');
  } catch (e) {
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
    return Promise.reject(); // caught in calling methods .catch()
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

//
// Model method findByCredentials
//
UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject(); // caught in calling methods .catch()
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (err) {
          return reject(err); // caught in calling methods .catch()
        }
        return res ? resolve(user) : reject();
      });
    });
  });
};

//
// overrides the mongoose built-in method
// every time a user is converted to JSON, only provide the _id and email properties
//
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject(); // wash away db storage structure and convert to a Javascript object

  return _.pick(userObject, ['_id', 'email']);
};

//
// mongoose middleware function pre()
// (fires before the 'save' event on User)
//
UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

//
// create the User model from UserSchema and export it
//
var User = mongoose.model('User', UserSchema);
module.exports = {User};
