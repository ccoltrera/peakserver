'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

import app from '../server';

var userObj1;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

// Create the users needed for the tests
before((done) => {
  models.User.findOrCreate({where: {email: 'c@colt.com', password: hashedPassword, salt: '$2a$10$somethingheretobeasalt'}})
    .then((users) => {
      userObj1 = users[0].dataValues;
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

describe('/user', () => {

  var generatedToken, expiredToken, badToken;

  // Generate tokens for tests
  before((done) => {
    generatedToken = jwt.sign({id: userObj1.id}, 'server secret', {expiresIn: '120m'});
    expiredToken = jwt.sign({id: userObj1.id}, 'server secret', {expiresIn: '0s'});
    badToken = jwt.sign({id: userObj1.id - 1}, 'server secret', {expiresIn: '120m'});
    done();
  });

  describe('GET', () => {

    it('should get a user\'s own info with proper JWT', (done) => {
      chai.request('http://localhost:3000')
        .get('/user')
        .set('Authorization', 'Bearer ' + generatedToken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.email).to.eql(userObj1.email);
          done();
        });
    });

    it('should reject a user with expired JWT', (done) => {
      chai.request('http://localhost:3000')
        .get('/user')
        .set('Authorization', 'Bearer ' + expiredToken)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should reject a user with JWT from non-existent user', (done) => {
      chai.request('http://localhost:3000')
        .get('/user')
        .set('Authorization', 'Bearer ' + badToken)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });
});

