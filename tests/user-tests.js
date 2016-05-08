'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

import app from '../server';

var userObj1, userObj2, userObj3;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

var address = 'http://localhost:3000';

// Create the users needed for the tests
before((done) => {
  models.User.create({email: 'c@colt.com', password: hashedPassword, salt: '$2a$10$somethingheretobeasalt'})
    .then((user) => {
      userObj1 = user;
      done();
    });
});

before((done) => {
  models.User.create({email: 'e@colt.com', password: hashedPassword, salt: '$2a$10$somethingheretobeasalt'})
    .then((user) => {
      userObj2 = user;
      done();
    });
});

before((done) => {
  models.User.create({email: 'f@colt.com', password: hashedPassword, salt: '$2a$10$somethingheretobeasalt'})
    .then((user) => {
      userObj3 = user;
      done();
    });
});

// Clean up the database
after((done) => {
  models.User.destroy({where: {}})
  .then(() => {
      done();
    });
});

// /users
describe('/users', () => {

  var goodToken, expiredToken, tokenToDelete;

  // Generate tokens for tests
  before((done) => {
    goodToken = jwt.sign({id: userObj1.id}, 'server secret', {expiresIn: '120m'});
    expiredToken = jwt.sign({id: userObj1.id}, 'server secret', {expiresIn: '0s'});
    tokenToDelete = jwt.sign({id: userObj3.id}, 'server secret', {expiresIn: '120s'});
    done();
  });

  // /users POST
  describe('POST', () => {
    it('should create a new user in the db, if no matching email exists, and return the user', (done) => {
      chai.request(address)
        .post('/users')
        .send({email: 'm@colt.com', password: 'password'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.email).to.eql('m@colt.com');
          expect(res.body.password).to.eql(null);

          models.User.find({where: {email: 'm@colt.com'}})
            .then((user) => {
              expect(user.dataValues).to.be.ok;
              expect(user.dataValues.email).to.eql('m@colt.com');
              expect(user.dataValues.salt).to.eql('$2a$10$somethingheretobeasalt');
              done();
            });
        });
    });

    it('send a 409 error if a user with that email address already exists', (done) => {
      chai.request(address)
        .post('/users')
        .send({email: 'c@colt.com', password: 'password'})
        .end((err, res) => {
          expect(res).to.have.status(409);
          done();
        });
    });
  });

  // /users/:user
  describe('/:user', ()=> {

    // /users/:user GET
    describe('GET', () => {
      it('should get a user\'s own info with proper JWT', (done) => {
        chai.request(address)
          .get('/users/' + userObj1.id)
          .set('Authorization', 'Bearer ' + goodToken)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.email).to.eql(userObj1.email);
            done();
          });
      });

      it('should reject a user with expired JWT', (done) => {
        chai.request(address)
          .get('/users/' + userObj1.id)
          .set('Authorization', 'Bearer ' + expiredToken)
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });

      it('should get another user\'s info with proper JWT', (done) => {
        chai.request(address)
          .get('/users/' + userObj2.id)
          .set('Authorization', 'Bearer ' + goodToken)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.email).to.eql(userObj2.email);
            expect(res.body.password).to.eql(null);
            done();
          });
      });

      it('should return 404 status if no matching user', (done) => {
        chai.request(address)
          .get('/users/' + (userObj1.id - 1) )
          .set('Authorization', 'Bearer ' + goodToken)
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
          .post('/users/' + userObj1.id)
          .set('Authorization', 'Bearer ' + goodToken)
          .send({firstName: 'C', lastName: 'Colt'})
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.firstName).to.eql('C');
            expect(res.body.password).to.eql(null);

            models.User.find({where: {email: 'c@colt.com'}})
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
          .del('/users/' + userObj3.id)
          .set('Authorization', 'Bearer ' + tokenToDelete)
          .end((err, res) => {
            expect(res).to.have.status(200);

            models.User.find({where: {email: 'f@colt.com'}})
              .then((user) => {
                expect(user).to.not.be.ok;
                done();
              });
          });
      });

      it('should send 401 if attempt is made to delete another user', (done) => {
        chai.request(address)
          .del('/users/' + userObj2.id)
          .set('Authorization', 'Bearer ' + goodToken)
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });
    });
  });
});

