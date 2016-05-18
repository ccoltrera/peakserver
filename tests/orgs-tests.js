'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

var address = 'http://localhost:3000/api';

var user1, user2, user1Token, user2Token, org1, org2, org3;

var salt = '$2a$10$somethingheretobeasalt';
var hashedPassword = bcrypt.hashSync('password', salt);

var userObj1 = {
  email: '1@orgs.com',
  password: hashedPassword,
  salt: salt
};

var userObj2 = {
  email: '2@orgs.com',
  password: hashedPassword,
  salt: salt
};

// Led by user1, for GET
var orgObj1 = {
  name: 'orgs.org1',
  password: hashedPassword,
  salt: salt
};

// Led by user1, for POST /orgs/:org
var orgObj2 = {
  name: 'orgs.org2',
  password: hashedPassword,
  salt: salt
};

// Led by user2, for DEL /orgs/:org
var orgObj3 = {
  name: 'orgs.org3',
  password: hashedPassword,
  salt: salt
};

// For POST /orgs, to be led by user2
var orgObj4 = {
  name: 'orgs.org4',
  password: 'password'
};

// Create users and organizations needed for tests
before((done) => {
  models.User.create(userObj1)
    .then((user) => {
      user1 = user;
      return models.Organization.create(orgObj1);
    })
    .then((org) => {
      org1 = org;
      return org1.setLeader(user1);
    })
    .then(() => {
      return models.Organization.create(orgObj2);
    })
    .then((org) => {
      org2 = org;
      return org2.setLeader(user1);
    })
    .then(() => {
      done();
    });
});

before((done) => {
  models.User.create(userObj2)
    .then((user) => {
      user2 = user;
      return models.Organization.create(orgObj3);
    })
    .then((org) => {
      org3 = org;
      return org3.setLeader(user2);
    })
    .then(() => {
      done();
    });
});

// Generate tokens for tests
before((done) => {
  user1Token = jwt.sign({id: user1.id}, 'server secret', {expiresIn: '120m'});
  user2Token = jwt.sign({id: user2.id}, 'server secret', {expiresIn: '120m'});
  done();
});

// Clean up database
after((done) => {
  models.User.destroy({where: {email: {$like: '%@orgs.com'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Organization.destroy({where: {name: {$like: 'orgs.org%'}}})
  .then(() => {
      done();
    });
});

// /orgs
describe('/api/orgs', () => {

  // /orgs POST
  describe('POST', () => {
    it('should create a new org in the db if no matching org exists, with creating user as leader — and return the org', (done) => {
      chai.request(address)
        .post('/orgs')
        .set('Authorization', 'Bearer ' + user2Token)
        .send(orgObj4)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.eql(orgObj4.name);
          expect(res.body.password).to.not.be.ok;
          expect(res.body.salt).to.not.be.ok;

          models.Organization.findOne({
            where: {name: orgObj4.name},
            include: [{
              model: models.User,
              as: 'Leader'
            }]
          })
          .then((org) => {
            expect(org).to.be.ok;
            expect(org.dataValues.name).to.eql(orgObj4.name);
            expect(org.dataValues.password).to.eql(hashedPassword);
            expect(org.Leader.email).to.eql(user2.email);
            return org.getUsers();
          })
          .then((users) => {
            expect(users.length).to.eql(1);
            expect(users[0].dataValues.id).to.eql(user2.id);
            done();
          })
        });
    });

    it('send a 409 error if an org with that name already exists', (done) => {
      chai.request(address)
        .post('/orgs')
        .set('Authorization', 'Bearer ' + user2Token)
        .send(orgObj1)
        .end((err, res) => {
          expect(res).to.have.status(409);
          done();
        });
    });

  });

  describe('GET', () => {
    it('should return orgs that match the query string, with proper JWT', (done) => {
      chai.request(address)
        .get('/orgs')
        .set('Authorization', 'Bearer ' + user1Token)
        .query({name: {$like: orgObj1.name}})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.length).to.eql(1);
          expect(res.body[0].password).to.not.be.ok;
          expect(res.body[0].salt).to.not.be.ok;

          done();
        });
    });
  });

  // /orgs/:org
  describe('/:org', () => {

    // /orgs/:org GET
    describe('GET', () => {
      it('should get specific org info with proper JWT', (done) => {
        chai.request(address)
          .get('/orgs/' + org1.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.name).to.eql(org1.name);
            expect(res.body.password).to.not.be.ok;
            expect(res.body.salt).to.not.be.ok;

            done();
          });
      });

      it('should return 404 status if no matching org', (done) => {
        chai.request(address)
          .get('/orgs/' + (org1.id + 1000) )
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });
    });

    // /orgs/:org POST
    describe('POST', () => {
      it('should change org info based on JSON, with JWT matching leader, send updated org', (done) => {
        chai.request(address)
          .post('/orgs/' + org2.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .send({name: 'orgs.org2.updated', leader: user2.id})
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.name).to.eql('orgs.org2.updated');
            expect(res.body.password).to.not.be.ok;
            expect(res.body.salt).to.not.be.ok;

            models.Organization.findById(org2.id)
              .then((org) => {
                expect(org.dataValues.name).to.eql('orgs.org2.updated');
                return org.getLeader();
              })
              .then((leader) => {
                expect(leader.dataValues.email).to.eql(user2.email);
                done();
              });
          });
      });

      it('should send 401, when JWT does not match leader', (done) => {
        chai.request(address)
          .post('/orgs/' + org1.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .send({name: 'orgs.org2.updated'})
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });

      it('should send 404, if org does not exist', (done) => {
        chai.request(address)
          .post('/orgs/' + (org1.id + 1000))
          .set('Authorization', 'Bearer ' + user2Token)
          .send({name: 'orgs.org2.updated'})
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });
    });

    // /orgs/:org DEL
    describe('DELETE', () => {
      it('should delete an org in the db, with JWT matching leader', (done) => {
        chai.request(address)
          .del('/orgs/' + org3.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(200);

            models.Organization.findOne({where: {name: 'orgs.org3'}})
              .then((org) => {
                expect(org).to.not.be.ok;
                done();
              });
          });
      });

      it('should send 401 if attempt is made to delete org where JWT does not match leader', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });

      it('should send 404 if org does not exist', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });
    });
  });
});

