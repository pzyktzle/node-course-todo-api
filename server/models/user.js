const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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

// Schema.methods stores instance methods for a schema (var user = new User(data))
// arrow functions do not bind a 'this' keyword so function () {} is required
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'someSecretSalt').toString();

  // user.tokens.push({access, token});
  user.tokens = user.tokens.concat([{access, token}]);

  // return user.save().then promise unfired and requiring then() to be called before returning token
  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.toJSON = function () {
  var user = this;
  console.log(user);
  var userObject = user.toObject();
  console.log(userObject);

  return _.pick(userObject, ['_id', 'email']);
};

var User = mongoose.model('User', UserSchema);

module.exports = {User};
