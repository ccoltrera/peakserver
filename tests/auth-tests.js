'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

import app from '../server';

var properUserInfo = {
  username: '1@auth.com',
  password: 'password' };

var improperUserInfo = {
  username: '1@auth.com',
  password: 'notPassword' };

var address = 'http://localhost:3000/api';

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

var userObj1 = {
  email: '1@auth.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
}

var user1;

// Create users needed for tests
before((done) => {
  models.User.findOrCreate({where: userObj1})
    .then((users) => {
      user1 = users[0].dataValues;
      done();
    });
});

// Clean up database
after((done) => {
  models.User.destroy({where: {email: {$like: '%@auth.com'}}})
  .then(() => {
      done();
    });
});

describe('/api/auth', () => {

  describe('GET', () => {
    it('should return a JSON Web Token on proper credentials', function(done) {
      chai.request(address)
        .get('/auth')
        .query(properUserInfo)
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.token).to.be.ok;
          done();
        });
    });

    it('should reject improper credentials', function(done) {
      chai.request(address)
        .get('/auth')
        .query(improperUserInfo)
        .end(function(err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });
  });
});

