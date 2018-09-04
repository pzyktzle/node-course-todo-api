const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// var message = "I am user number 3";
// var hash = SHA256(message).toString();
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);
//
// var data = {
//   id: 4
// }
//
// // sent to user
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'someSecretSalt').toString()
// }
//
// // user tries to change the data and id of row they are trying to edit
// // without access to the salt
// token.data.id = 5;
// SHA256(JSON.stringify(token.data)).toString();
//
//
// // get data (id of row being changed) back from user
// var resultHash = SHA256(JSON.stringify(token.data) + 'someSecretSalt').toString();
//
// if (resultHash === token.hash) {
//   console.log('Data with id of row not changed');
// } else {
//   console.log('Data was changed. Do not trust!');
// }

// var data = {
//   id: 10
// }
//
// var token = jwt.sign(data, '123abc');
// console.log(token);
//
// var decoded = jwt.verify(token, '123abc');
// console.log('Decoded: ', decoded);

var password = '123abc';

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(hash);
  });
});

var hashedPassword = '$2a$10$TQSyLaTL4.u86ULbw/ExnOKbV6woQTZOnsPCFA74ooz5JuYBSVAMe';

bcrypt.compare(password, hashedPassword, (err, res) => {
  console.log(res); // true
});
