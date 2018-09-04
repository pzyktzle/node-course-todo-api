const {User} = require('./../models/user');

var authenticate = (req, res, next) => {
  var token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject(); // will be caught in .catch()
    }

    // modify req as it passes through this middleware
    req.user = user; // user found with token
    req.token = token;
    next(); // finish middleware and move on to the route logic
  }).catch((e) => {
    res.status(401).send({error: 'not authenticated'});
  });
};

module.exports = {authenticate};
