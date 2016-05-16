'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

var address = 'http://localhost:3000/api';

var user1, user2, user1Token, user2Token, range1, range2, peak1, peak2;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

var userObj1 = {
  email: '1@range-peaks.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

var userObj2 = {
  email: '2@range-peaks.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

var rangeObj1 = {
  name: 'range-peaks.range1'
};

var rangeObj2 = {
  name: 'range-peaks.range2'
};

var peakObj1 = {
  name: 'range-peaks.peak1'
};

var peakObj2 = {
  name: 'range-peaks.peak2'
};

// Create users with ranges and peaks needed for tests
before((done) => {
  models.User.create(userObj1)
    .then((user) => {
      user1 = user;
      return models.Range.create(rangeObj1);
    })
    .then((range) => {
      range1 = range;
      var id = range1.id
      return user1.addRange(id);
    })
    .then(() => {
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

// Generate tokens for tests
before((done) => {
  user1Token = jwt.sign({id: user1.id}, 'server secret', {expiresIn: '120m'});
  user2Token = jwt.sign({id: user2.id}, 'server secret', {expiresIn: '120s'});
  done();
});

// Clean up the database
after((done) => {
  models.User.destroy({where: {email: {$like: '%@range-peaks.com'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Range.destroy({where: {name: {$like: 'range-peaks.range%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.RangePeak.destroy({where: {name: {$like: 'range-peaks.peak%'}}})
  .then(() => {
      done();
    });
});

// /api/users/:user/ranges/:range/peaks
describe('/api/users/:user/ranges/:range/peaks', () => {

  // /api/users/:user/ranges/:range/peaks POST
  describe('POST', () => {

    it('should add a peak to the db and associate it with the range, with a JWT that matches owning user', (done) => {
    });

    it('should send a 401 status if the JWT does not match the range owning user', (done) => {

    });

  });

  // /api/users/:user/ranges/:range/peaks GET
  describe('GET', () => {

    it('should get all peaks for a given range, with proper JWT', (done) => {

    });

    it('should get send 404 for non existent user, or range', (done) => {

    });

  });

  // /api/users/:user/ranges/:range/peaks/:peak
  describe('/:peak', () => {

    describe('GET', () => {

      it('should get a specific peak, with proper JWT', (done) => {

      });

      it('should return a 404 if specific peak / range / user combo does not exist', (done) => {


      });

    });

    describe('POST', () => {

      it('should edit and return a peak, if range owning user matches JWT', (done) => {

      });

      it('should return a 404 if the peak does not exist', (done) => {

      });

      it('should return 401 if JWT does not match range / peak owning user', (done) => {

      });

    });

    describe('DELETE', () => {

      it('should delete a peak, if range owning user matches JWT', (done) => {

      });

      it('should return 404 if the peak does not exist', (done) => {

      });

      it('should return 401 if JWT does not match range owning user', (done) => {

      });

    });
  });

});
