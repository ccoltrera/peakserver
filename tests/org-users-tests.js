'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

var address = 'http://localhost:3000/api';

var user1, user2, user3, user4, user5, user6,
    user1Token, user2Token, user3Token, user4Token, user5Token, user6Token,
    org1;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

// leader of org1
var userObj1 = {
  email: '1@org-users.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// member of org1
var userObj2 = {
  email: '2@org-users.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// member of org 1, for DEL self
var userObj3 = {
  email: '3@org-users.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// member of org 1, for DEL by leader
var userObj4 = {
  email: '4@org-users.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// not member of org 1, for POST
var userObj5 = {
  email: '5@org-users.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// not member of org 1, for GET without membership
var userObj6 = {
  email: '6@org-users.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// led by user1
var orgObj1 = {
  name: 'org-users.org1',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// Create users, organizations, and teams needed for tests
before((done) => {
  // create user1
  models.User.create(userObj1)
    // create org1
    .then((user) => {
      user1 = user;
      return models.Organization.create(orgObj1);
    })
    // set user 1 as org 1 leader
    .then((org) => {
      org1 = org;
      return org1.setLeader(user1);
    })
    // add user1 to org1
    .then(() => {
      return org1.addUser(user1);
    })
    // create user2
    .then(() => {
      return models.User.create(userObj2)
    })
    // add user2 to org1
    .then((user) => {
      user2 = user;
      return org1.addUser(user2);
    })
    // create user3
    .then(() => {
      return models.User.create(userObj3)
    })
    // add user3 to org1
    .then((user) => {
      user3 = user;
      return org1.addUser(user3);
    })
    // create user4
    .then(() => {
      return models.User.create(userObj4)
    })
    // add user4 to org1
    .then((user) => {
      user4 = user;
      return org1.addUser(user4);
    })
    .then(() => {
      done();
    });
});

before((done) => {
  models.User.create(userObj5)
    .then((user) => {
      user5 = user;
      done();
    });
});

before((done) => {
  models.User.create(userObj6)
    .then((user) => {
      user6 = user;
      done();
    });
});

// Generate tokens for tests
before((done) => {
  user1Token = jwt.sign({id: user1.id}, 'server secret', {expiresIn: '120m'});
  user2Token = jwt.sign({id: user2.id}, 'server secret', {expiresIn: '120m'});
  user3Token = jwt.sign({id: user3.id}, 'server secret', {expiresIn: '120m'});
  user4Token = jwt.sign({id: user4.id}, 'server secret', {expiresIn: '120m'});
  user5Token = jwt.sign({id: user5.id}, 'server secret', {expiresIn: '120m'});
  user6Token = jwt.sign({id: user6.id}, 'server secret', {expiresIn: '120m'});
  done();
});

// Clean up database
after((done) => {
  models.User.destroy({where: {email: {$like: '%@org-users.com'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Organization.destroy({where: {name: {$like: 'org-users.org%'}}})
  .then(() => {
      done();
    });
});

// /orgs/:org/users
describe('/api/orgs/:org/users', () => {

  describe('GET', () => {
    it('should return users in org that match the query string, with JWT that matches org member', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/users')
        .set('Authorization', 'Bearer ' + user1Token)
        .query({email: {$like: userObj2.email}})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.length).to.eql(1);
          expect(res.body[0].email).to.eql(userObj2.email);

          done();
        });
    });

    it('should return 401, without JWT that matches org member', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/users')
        .set('Authorization', 'Bearer ' + user6Token)
        .query({email: {$like: userObj1.email}})
        .end((err, res) => {
          expect(res).to.have.status(401);

          done();
        });
    });

    it('should return 404, if org not found', (done) => {
      chai.request(address)
        .get('/orgs/' + (org1.id + 1000) + '/users')
        .set('Authorization', 'Bearer ' + user1Token)
        .query({email: {$like: userObj2.email}})
        .end((err, res) => {
          expect(res).to.have.status(404);

          done();
        });
    });
  });

  // /orgs/:org/users POST
  describe('POST', () => {
    it('should add user to org, with org password', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/users')
        .set('Authorization', 'Bearer ' + user5Token)
        .send({password: 'password'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.eql(orgObj1.name);

          models.Organization.findOne({
            where: {id: org1.id},
            include: [{
              model: models.User,
              where: {id: user5.id}
            }]
          })
          .then((org) => {
            expect(org).to.be.ok;
            expect(org.Users[0].email).to.eql(userObj5.email);
            done();
          });
        });
    });

    it('send a 401 error if password does not match that of org', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/users')
        .set('Authorization', 'Bearer ' + user6Token)
        .send({password: 'notPassword'})
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

  });

  // /orgs/:org/users/:user
  describe('/:user', () => {

    // /orgs/:org/users/:user DEL
    describe('DELETE', () => {
      it('should remove a member of the org, with JWT matching self', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id + '/users/' + user3.id)
          .set('Authorization', 'Bearer ' + user3Token)
          .end((err, res) => {
            expect(res).to.have.status(200);

            models.Organization.findOne({
              where: {id: org1.id},
              include: [{
                model: models.User,
                where: {id: user3.id}
              }]
            })
            .then((org) => {
              expect(org).to.not.be.ok;
              done();
            });
          });
      });

      it('should remove a member of the org, with JWT matching org leader', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id + '/users/' + user4.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(200);

            models.Organization.findOne({
              where: {id: org1.id},
              include: [{
                model: models.User,
                where: {id: user4.id}
              }]
            })
            .then((org) => {
              expect(org).to.not.be.ok;
              done();
            });
          });
      });

      it('should send 401 if attempt is made to remove member, where JWT does not match org leader or user', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id + '/users/' + user1.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });

      it('should send 404 if org not found', (done) => {
        chai.request(address)
          .del('/orgs/' + (org1.id + 1000) + '/users/' + user1.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });
    });
  });
});
