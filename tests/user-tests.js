'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

import app from '../server';

var userObj1, userObj2;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

var address = 'http://localhost:3000';

// Create the users needed for the tests
before((done) => {
  models.User.findOrCreate({where: {email: 'c@colt.com', password: hashedPassword, salt: '$2a$10$somethingheretobeasalt'}})
    .then((users) => {
      userObj1 = users[0].dataValues;
      done();
    });
});

before((done) => {
  models.User.findOrCreate({where: {email: 'e@colt.com', password: hashedPassword, salt: '$2a$10$somethingheretobeasalt'}})
    .then((users) => {
      userObj2 = users[0].dataValues;
      done();
    });
});

// Clean up the database
after((done) => {
  models.User.destroy({where: {email: 'c@colt.com'}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.User.destroy({where: {email: 'e@colt.com'}})
  .then(() => {
      done();
    });
});

describe('/user', () => {

  var goodToken, expiredToken, badToken;

  // Generate tokens for tests
  before((done) => {
    goodToken = jwt.sign({id: userObj1.id}, 'server secret', {expiresIn: '120m'});
    expiredToken = jwt.sign({id: userObj1.id}, 'server secret', {expiresIn: '0s'});
    badToken = jwt.sign({id: userObj1.id - 1}, 'server secret', {expiresIn: '120m'});
    done();
  });

  describe('GET', () => {

    it('should get a user\'s own info with proper JWT', (done) => {
      chai.request(address)
        .get('/user')
        .set('Authorization', 'Bearer ' + goodToken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.email).to.eql(userObj1.email);
          done();
        });
    });

    it('should reject a user with expired JWT', (done) => {
      chai.request(address)
        .get('/user')
        .set('Authorization', 'Bearer ' + expiredToken)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should reject a user with JWT from non-existent user', (done) => {
      chai.request(address)
        .get('/user')
        .set('Authorization', 'Bearer ' + badToken)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should get another user\'s info with proper JWT and query', (done) => {
      chai.request(address)
        .get('/user')
        .set('Authorization', 'Bearer ' + goodToken)
        .query({id: userObj2.id})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.email).to.eql(userObj2.email);
          done();
        });
    });
  });

  describe('POST', () => {
    it('should change user\'s own info based on json, with proper JWT', (done) => {
      chai.request(address)
        .post('/user')
        .set('Authorization', 'Bearer ' + goodToken)
        .send({firstName: 'C', lastName: 'Colt'})
        .end((err, res) => {
          expect(res).to.have.status(200);

          models.User.find({where: {email: 'c@colt.com'}})
            .then((user) => {
              expect(user.dataValues.firstName).to.eql('C');
              expect(user.dataValues.lastName).to.eql('Colt');
              done();
            });
        });
    });
  });
});

