const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

// seed data
const {todos, users, populateTodos, populateUsers} = require('./seed/seed');

// wipe database and insert todos and users seed data before each test
beforeEach(populateUsers);
beforeEach(populateTodos);

//
// test GET /todos
//
describe('GET /todos', () => {

  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

//
// test GET /todos/:id
//
describe('GET /todos/:id', () => {

  it('should return todo with provided id', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found for a valid object id', (done) => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for invalid object ids', (done) => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  });
});

//
// test POST /todos
//
describe('POST /todos', () => {

  it('should create a new todo', (done) => {
    var text = 'todo text inserted via POST /todos';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        // test db
        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {

    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        // test db
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

//
// test DELETE /todos/:id
//
describe('DELETE /todos/:id', () => {

  it('should remove a todo', (done) => {
    request(app)
      .delete(`/todos/${todos[1]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(todos[1]._id.toHexString());
      })
      .end((err, res) => {
        if (err) {
          done(err);
        }

        // test db
        Todo.findById(todos[1]._id.toHexString()).then((todo) => {
          expect(todo).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if invalid id', (done) => {
    request(app)
      .delete('/todos/123')
      .expect(404)
      .end(done);
  });
});

//
// test PATCH /todos/:id
//
describe('PATCH /todos/:id', () => {

  it('should update and complete todo', (done) => {
    var text = 'todo text updated via PATCH /todos/:id 1'
    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send({text, completed: true})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done);
  });

  it('should uncomplete a completed todo', (done) => {
    var text = 'todo text updated via PATCH /todos/:id 2'
    request(app)
      .patch(`/todos/${todos[1]._id.toHexString()}`)
      .send({text, completed: false})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeNull();
      })
      .end(done);
  });
});

//
// test GET /users/me
//
describe('GET /users/me', () => {

  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.user._id).toBe(users[0]._id.toHexString());
        expect(res.body.user.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({error: 'not authenticated'});
      })
      .end(done);
  });
});

//
// test POST /users
//
describe('POST /users', () => {

  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = '123abc';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy(); // to exist
        expect(res.body.user._id).toBeTruthy(); // to exist
        expect(res.body.user.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        // test db
        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy(); // to exist
          expect(user.password).not.toBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    var invalidEmail = 'example.com';
    var invalidPassword = '1';

    request(app)
      .post('/users')
      .send({invalidEmail, invalidPassword})
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    var userOne = users[0];
    request(app)
      .post('/users')
      .send({userOne})
      .expect(400)
      .end(done);
  });
});

//
// test POST /users/login
//
describe('POST /users/login', () => {

  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy(); // to exist
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        // test db
        User.findById(users[1]._id).then((user) => {
          // expect(user.tokens[0]).toInclude({
          //   access: 'auth',
          //   token: res.headers['x-auth']
          // });

          expect(user.tokens[0]).toHaveProperty('access', 'auth');
          expect(user.tokens[0]).toHaveProperty('token', res.headers['x-auth']);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: 'wrongPassword'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy(); // to not exist
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        // test db
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens).toHaveLength(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
