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

var properUserInfo = {
  username: 'c@colt.com',
  password: 'password' };

var improperUserInfo = {
  username: 'c@colt.com',
  password: 'notPassword' };


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

describe('/auth', () => {

  describe('GET', () => {
    it('should return a JSON Web Token on proper credentials', function(done) {
      chai.request('http://localhost:3000')
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
      chai.request('http://localhost:3000')
        .get('/auth')
        .query(improperUserInfo)
        .end(function(err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });
  });
});

