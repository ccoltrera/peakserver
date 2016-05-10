'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

var address = 'http://localhost:3000/api';

var user1, user1Token, range1;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

var userObj1 = {
  email: '1@range.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

var rangeObj1 = {
  name: 'range1'
};

var rangeObj2 = {
  name: 'range2'
};

// Create user with ranges needed for tests
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
      // return user1.update({RangeId: range1.id})
    })
    .then(() => {
      done();
    });
});

// Generate tokens for tests
before((done) => {
  user1Token = jwt.sign({id: user1.id}, 'server secret', {expiresIn: '120m'});
  done();
});

// Clean up the database
after((done) => {
  models.User.destroy({where: {email: {$like: '%@range.com'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Range.destroy({where: {name: {$like: 'range%'}}})
  .then(() => {
      done();
    });
})

// /api/users/:user/ranges
describe('/api/users/:user/ranges', () => {

  // /api/users/:user/ranges GET
  describe('POST', () => {

    it('should add a range to the db and associate it with the user, with a JWT that matches', (done) => {
      chai.request(address)
        .post('/users/' + user1.id + '/ranges')
        .set('Authorization', 'Bearer ' + user1Token)
        .send(rangeObj2)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.eql(rangeObj2.name);

          user1.getRanges()
            .then((ranges) => {
              expect(ranges.length).to.eql(2);

              done();
            })
        });
    });

    it('should send a 401 status if the JWT does not match the user', (done) => {
      chai.request(address)
        .post('/users/' + (user1.id - 1) + '/ranges')
        .set('Authorization', 'Bearer ' + user1Token)
        .send(rangeObj1)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should send a 409 status if the range name is not unique for the user', (done) => {
      chai.request(address)
        .post('/users/' + user1.id + '/ranges')
        .set('Authorization', 'Bearer ' + user1Token)
        .send(rangeObj1)
        .end((err, res) => {
          expect(res).to.have.status(409);
          done();
        });
    });
  });

});
