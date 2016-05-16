'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

var address = 'http://localhost:3000/api';

var user1, user2, user3, user1Token, user2Token, user3Token, range1, range3, range4;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

var userObj1 = {
  email: '1@ranges.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

var userObj2 = {
  email: '2@ranges.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

var userObj3 = {
  email: '3@ranges.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

var rangeObj1 = {
  name: 'ranges.range1'
};

var rangeObj2 = {
  name: 'ranges.range2'
};

var rangeObj3 = {
  name: 'ranges.range3'
};

var rangeObj4 = {
  name: 'ranges.range4'
};

// Create users with ranges needed for tests
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

before((done) => {
  models.User.create(userObj3)
    .then((user) => {
      user3 = user;
      return models.Range.create(rangeObj3);
    })
    .then((range) => {
      range3 = range;
      var id = range3.id
      return user3.addRange(id);
    })
    .then(() => {
      return models.Range.create(rangeObj4);
    })
    .then((range) => {
      range4 = range;
      var id = range4.id
      return user3.addRange(id);
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
  user3Token = jwt.sign({id: user3.id}, 'server secret', {expiresIn: '120s'});
  done();
});

// Clean up the database
after((done) => {
  models.User.destroy({where: {email: {$like: '%@ranges.com'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Range.destroy({where: {name: {$like: 'ranges.range%'}}})
  .then(() => {
      done();
    });
})

// /api/users/:user/ranges
describe('/api/users/:user/ranges', () => {

  // /api/users/:user/ranges POST
  describe('POST', () => {

    it('should add a range to the db and associate it with the user, with a JWT that matches', (done) => {
      chai.request(address)
        .post('/users/' + user2.id + '/ranges')
        .set('Authorization', 'Bearer ' + user2Token)
        .send(rangeObj2)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.eql(rangeObj2.name);

          user1.getRanges()
            .then((ranges) => {
              expect(ranges.length).to.eql(1);

              done();
            })
        });
    });

    it('should send a 401 status if the JWT does not match the user', (done) => {
      chai.request(address)
        .post('/users/' + user1.id + '/ranges')
        .set('Authorization', 'Bearer ' + user2Token)
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

  // /api/users/:user/ranges GET
  describe('GET', () => {

    it('should get all ranges for a user with proper JWT', (done) => {
      chai.request(address)
        .get('/users/' + user1.id + '/ranges')
        .set('Authorization', 'Bearer ' + user1Token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.length).to.eql(1);
          expect(res.body[0].name).to.eql(range1.name);
          done();
        });
    });

    it('should get send 404 for non existent user', (done) => {
      chai.request(address)
        .get('/users/' + (user1.id + 1000) + '/ranges')
        .set('Authorization', 'Bearer ' + user1Token)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

  });

  // /api/users/:user/ranges/:range
  describe('/:range', () => {

    describe('GET', () => {

      it('should get a specific range, with proper JWT', (done) => {
        chai.request(address)
          .get('/users/' + (user1.id) + '/ranges/' + range1.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.name).to.eql(range1.name);
            done();
          });

      });

      it('should return a 404 if specific user does not exist', (done) => {
        chai.request(address)
          .get('/users/' + (user1.id + 1000) + '/ranges/' + (range1.id))
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });

      });

      it('should return a 404 if specific range and user combo does not exist', (done) => {
        chai.request(address)
          .get('/users/' + (user1.id) + '/ranges/' + (range1.id + 1000))
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });

      });

    });

    describe('POST', () => {

      it('should edit and return a range, if user matches JWT', (done) => {
        chai.request(address)
          .post('/users/' + (user3.id) + '/ranges/' + range3.id)
          .set('Authorization', 'Bearer ' + user3Token)
          .send({name: 'ranges.range3.updated'})
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.name).to.eql('ranges.range3.updated');
            models.Range.findById(range3.id)
              .then((range) => {
                expect(range.name).to.eql('ranges.range3.updated');
                done();
              });
          });

      });

      it('should return a 404 if the range does not exist', (done) => {
        chai.request(address)
          .post('/users/' + (user3.id) + '/ranges/' + (range3.id + 1000))
          .set('Authorization', 'Bearer ' + user3Token)
          .send({name: 'ranges.range1000'})
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });

      });

      it('should return 401 if JWT does not match range owning user', (done) => {
        chai.request(address)
          .post('/users/' + (user1.id) + '/ranges/' + range1.id)
          .set('Authorization', 'Bearer ' + user3Token)
          .send({name: 'ranges.range1.updated'})
          .end((err, res) => {
            expect(res).to.have.status(401);
            models.Range.findById(range1.id)
              .then((range) => {
                expect(range.name).to.eql('ranges.range1');
                done();
              });
          });
      });

    });

    describe('DELETE', () => {

      it('should delete a range, if user matches JWT', (done) => {
        chai.request(address)
          .del('/users/' + (user3.id) + '/ranges/' + range4.id)
          .set('Authorization', 'Bearer ' + user3Token)
          .end((err, res) => {
            expect(res).to.have.status(200);
            models.Range.findById(range4.id)
              .then((range) => {
                expect(range).to.not.be.ok;
                done();
              });
          });
      });

      it('should return 404 if the range does not exist', (done) => {
        chai.request(address)
          .del('/users/' + (user3.id) + '/ranges/' + (range3.id + 1000))
          .set('Authorization', 'Bearer ' + user3Token)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });

      it('should return 401 if JWT does not match range owning user', (done) => {
        chai.request(address)
          .del('/users/' + (user1.id) + '/ranges/' + range1.id)
          .set('Authorization', 'Bearer ' + user3Token)
          .end((err, res) => {
            expect(res).to.have.status(401);
            models.Range.findById(range1.id)
              .then((range) => {
                expect(range).to.be.ok;
                done();
              });
          });
      });

    });
  });

});
