'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

var address = 'http://localhost:3000/api';

var user1, user2, user3, user1Token, expiredToken, user3Token;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

var userObj1 = {
  email: '1@user.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

var userObj2 = {
  email: '2@user.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

var userObj3 = {
  email: '3@user.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// Create users needed for tests
before((done) => {
  models.User.create(userObj1)
    .then((user) => {
      user1 = user;
      done();
    });
});

before((done) => {
  models.User.create(userObj2)
    .then((user) => {
      user2 = user;
      done();
    });
});

before((done) => {
  models.User.create(userObj3)
    .then((user) => {
      user3 = user;
      done();
    });
});

// Generate tokens for tests
before((done) => {
  user1Token = jwt.sign({id: user1.id}, 'server secret', {expiresIn: '120m'});
  expiredToken = jwt.sign({id: user1.id}, 'server secret', {expiresIn: '0s'});
  user3Token = jwt.sign({id: user3.id}, 'server secret', {expiresIn: '120s'});
  done();
});

// Clean up database
after((done) => {
  models.User.destroy({where: {email: {$like: '%@user.com'}}})
  .then(() => {
      done();
    });
});

// /users
describe('/api/users', () => {

  // /users POST
  describe('POST', () => {
    it('should create a new user in the db, if no matching email exists, and return the user', (done) => {
      chai.request(address)
        .post('/users')
        .send({email: '4@user.com', password: 'password'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.email).to.eql('4@user.com');
          expect(res.body.password).to.eql(null);

          models.User.find({where: {email: '4@user.com'}})
            .then((user) => {
              expect(user.dataValues).to.be.ok;
              expect(user.dataValues.email).to.eql('4@user.com');
              expect(user.dataValues.salt).to.eql('$2a$10$somethingheretobeasalt');
              done();
            });
        });
    });

    it('send a 409 error if a user with that email address already exists', (done) => {
      chai.request(address)
        .post('/users')
        .send({email: userObj1.email, password: 'password'})
        .end((err, res) => {
          expect(res).to.have.status(409);
          done();
        });
    });
  });

  describe('GET', () => {
    it('should return users that match the query string, with proper JWT', (done) => {
      chai.request(address)
        .get('/users')
        .set('Authorization', 'Bearer ' + user1Token)
        .query({email: {$like: '1@user.com'}})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.length).to.eql(1);

          done();
        });
    });
  });

  // /users/:user
  describe('/:user', () => {

    // /users/:user GET
    describe('GET', () => {
      it('should get a user\'s own info with proper JWT', (done) => {
        chai.request(address)
          .get('/users/' + user1.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.email).to.eql(user1.email);
            done();
          });
      });

      it('should reject a user with expired JWT', (done) => {
        chai.request(address)
          .get('/users/' + user1.id)
          .set('Authorization', 'Bearer ' + expiredToken)
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });

      it('should get another user\'s info with proper JWT', (done) => {
        chai.request(address)
          .get('/users/' + user2.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.email).to.eql(user2.email);
            expect(res.body.password).to.eql(null);
            done();
          });
      });

      it('should return 404 status if no matching user', (done) => {
        chai.request(address)
          .get('/users/' + (user1.id + 1000) )
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });
    });

    // /users/:user POST
    describe('POST', () => {
      it('should change user\'s own info based on json, with proper JWT, send updated user', (done) => {
        chai.request(address)
          .post('/users/' + user1.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .send({firstName: 'C', lastName: 'Colt'})
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.firstName).to.eql('C');
            expect(res.body.password).to.eql(null);

            models.User.find({where: {email: userObj1.email}})
              .then((user) => {
                expect(user.dataValues.firstName).to.eql('C');
                expect(user.dataValues.lastName).to.eql('Colt');
                done();
              });
          });
      });
    });

    // /users/:user DEL
    describe('DELETE', () => {
      it('should delete a users own entry in the db', (done) => {
        chai.request(address)
          .del('/users/' + user3.id)
          .set('Authorization', 'Bearer ' + user3Token)
          .end((err, res) => {
            expect(res).to.have.status(200);

            models.User.find({where: {email: '3@user.com'}})
              .then((user) => {
                expect(user).to.not.be.ok;
                done();
              });
          });
      });

      it('should send 401 if attempt is made to delete another user', (done) => {
        chai.request(address)
          .del('/users/' + user2.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });
    });
  });
});

