// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server.');
  }
  console.log('Connected to MongoDB server.');
  const db = client.db('TodoApp');

  // db.collection('Todos').findOneAndUpdate(
  //   { _id: new ObjectID('5b88f1e9f2d02fde3d6a8108') },
  //   { $set: { completed: true } },
  //   { returnOriginal: false }
  // ).then((result) => {
  //   console.log(result);
  // });

  db.collection('Users').findOneAndUpdate(
    { _id: new ObjectID('5b88e47bf2d02fde3d6a7f32') },
    {
      $set: { name: 'Adrian' },
      $inc: { age: 1 }
    },
    { returnOriginal: false }
  ).then((result) => {
    console.log(result);
  });


  // client.close();
});
