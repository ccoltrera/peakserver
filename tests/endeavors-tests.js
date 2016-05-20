'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

var address = 'http://localhost:3000/api';

var user1, user2, user3,
    user1Token, user2Token, user3Token,
    org1,
    team1,
    endeavor1, endeavor3, endeavor4;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

// member of org1, member of team1 (for POST, DEL)
var userObj1 = {
  email: '1@endeavors.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// member of org1 (for GET, unsuccessful POST and DEL)
var userObj2 = {
  email: '2@endeavors.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// not member of org 1 (for unsuccessful GET)
var userObj3 = {
  email: '3@endeavors.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

//
var orgObj1 = {
  name: 'endeavors.org1',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

//
var teamObj1 = {
  name: 'endeavors.team1'
};

// used for GET
var endeavorObj1 = {
  name: 'endeavors.endeavor1'
};

// used for /endeavors POST
var endeavorObj2 = {
  name: 'endeavors.endeavor2'
};

// used for /endeavors/:endeavor POST
var endeavorObj3 = {
  name: 'endeavors.endeavor3'
};

// used for /endeavors/:endeavor DEL
var endeavorObj4 = {
  name: 'endeavors.endeavor4'
};

// used for /endeavors unsuccessful POST
var endeavorObj5 = {
  name: 'endeavors.endeavor5'
};

// Create users, organization, team, and endeavors needed for tests
before((done) => {
  // create user1
  models.User.create(userObj1)
    // create org1
    .then((user) => {
      user1 = user;
      return models.Organization.create(orgObj1);
    })
    // create user2
    .then((org) => {
      org1 = org;
      return models.User.create(userObj2)
    })
    // add user 1 and user2 to org1
    .then((user) => {
      user2 = user;
      return org1.addUsers([user1, user2]);
    })
    // create team1
    .then(() => {
      return models.Team.create(teamObj1)
    })
    // add user1 to team1
    .then((team) => {
      team1 = team;
      return team1.addUser(user1);
    })
    // add team1 to org1
    .then(() => {
      return org1.addTeam(team1);
    })
    // create endeavor1
    .then(() => {
      return models.Endeavor.create(endeavorObj1);
    })
    // create endeavor3
    .then((endeavor) => {
      endeavor1 = endeavor;
      return models.Endeavor.create(endeavorObj3);
    })
    .then((endeavor) => {
      endeavor3 = endeavor;
      return models.Endeavor.create(endeavorObj4);
    })
    // add endeavor1, endeavor3, and endeavor4 to team1
    .then((endeavor) => {
      endeavor4 = endeavor;
      return team1.addEndeavors([endeavor1, endeavor3, endeavor4]);
    })
    .then(() => {
      done();
    });
});

before((done) => {
  models.User.create(userObj3)
    .then((user) => {
      user3 = user;
      done();
    });
});

// Generate tokens for tests
before((done) => {
  user1Token = jwt.sign({id: user1.id}, 'server secret', {expiresIn: '120m'});
  user2Token = jwt.sign({id: user2.id}, 'server secret', {expiresIn: '120m'});
  user3Token = jwt.sign({id: user3.id}, 'server secret', {expiresIn: '120m'});
  done();
});

// Clean up database
after((done) => {
  models.User.destroy({where: {email: {$like: '%@endeavors.com'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Organization.destroy({where: {name: {$like: 'endeavors.org%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Team.destroy({where: {name: {$like: 'endeavors.team%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Endeavor.destroy({where: {name: {$like: 'endeavors.endeavor%'}}})
  .then(() => {
      done();
    });
});

// /orgs/:org/teams/:team/endeavors
describe('/api/orgs/:org/teams/:team/endeavors', () => {

  // /orgs/:org/teams/:team/endeavors GET
  describe('GET', () => {
    it('should return a team\'s endeavors that match the query string, with JWT that matches org member', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors')
        .set('Authorization', 'Bearer ' + user2Token)
        .query({name: {$like: endeavorObj1.name}})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.length).to.eql(1);
          expect(res.body[0].name).to.eql(endeavorObj1.name);

          done();
        });
    });

    it('should return 401, without JWT that matches org member', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors')
        .set('Authorization', 'Bearer ' + user3Token)
        .query({name: {$like: endeavorObj1.name}})
        .end((err, res) => {
          expect(res).to.have.status(401);

          done();
        });
    });

    it('should return 404, if org / team combo not found', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/teams/' + (team1.id + 1000) + '/endeavors')
        .set('Authorization', 'Bearer ' + user1Token)
        .query({name: {$like: endeavorObj1.name}})
        .end((err, res) => {
          expect(res).to.have.status(404);

          done();
        });
    });
  });

  // /orgs/:org/teams/:team/endeavors POST
  describe('POST', () => {
    it('should create a new endeavor belonging to team, if user a member', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors')
        .set('Authorization', 'Bearer ' + user1Token)
        .send(endeavorObj2)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.eql(endeavorObj2.name);

          models.Organization.findOne({
            where: {id: org1.id},
            include: [{
              model: models.Team,
              where: {id: team1.id},
              include: [{
                model: models.Endeavor,
                where: {name: endeavorObj2.name}
              }]
            }]
          })
          .then((org) => {
            expect(org).to.be.ok;
            expect(org.Teams[0].Endeavors[0].dataValues.name).to.eql(endeavorObj2.name);
            done();
          })
        });
    });

    it('send a 409 error if endeavor with that name already exists for team', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors')
        .set('Authorization', 'Bearer ' + user1Token)
        .send(endeavorObj1)
        .end((err, res) => {
          expect(res).to.have.status(409);
          done();
        });
    });

    it('send a 401 error if JWT does not match member of team', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors')
        .set('Authorization', 'Bearer ' + user2Token)
        .send(endeavorObj5)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

  });

  // /orgs/:org/teams/:team/endeavors/:endeavor
  describe('/:endeavor', () => {

    // /orgs/:org/teams/:team/endeavors/:endeavor GET
    describe('GET', () => {
      it('should get specific endeavor info with JWT that matches org member', (done) => {
        chai.request(address)
          .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.name).to.eql(endeavor1.name);
            done();
          });
      });

      it('should return 404 status if no matching org / team / endeavor combo', (done) => {
        chai.request(address)
          .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + (endeavor1.id + 1000))
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });

      it('should return 401 status if JWT does not match org member', (done) => {
        chai.request(address)
          .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id)
          .set('Authorization', 'Bearer ' + user3Token)
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });
    });

    // /orgs/:org/teams/:team/endeavors/:endeavor POST
    describe('POST', () => {
      it('should change endeavor info based on JSON, with JWT matching team member, send updated endeavor', (done) => {
        chai.request(address)
          .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor3.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .send({name: 'endeavors.endeavor3.updated', leader: user1.id})
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.name).to.eql('endeavors.endeavor3.updated');

            models.Endeavor.findById(endeavor3.id)
              .then((endeavor) => {
                expect(endeavor.dataValues.name).to.eql('endeavors.endeavor3.updated');
                done();
              });
          });
      });

      it('should send 401, when JWT does not match team member', (done) => {
        chai.request(address)
          .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .send({name: 'endeavors.endeavor1.updated'})
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });

      it('should send 404, if org / team / endeavor combo does not exist', (done) => {
        chai.request(address)
          .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + (endeavor1.id + 1000))
          .set('Authorization', 'Bearer ' + user1Token)
          .send({name: 'endeavors.endeavor1.updated'})
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });
    });

    // /orgs/:org/teams/:team/endeavors/:endeavor DEL
    describe('DELETE', () => {
      it('should destroy an endeavor in the db, with JWT matching team member', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor4.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(200);

            models.Endeavor.findOne({where: {name: 'endeavors.endeavor4'}})
              .then((endeavor) => {
                expect(endeavor).to.not.be.ok;
                done();
              });
          });
      });

      it('should send 401 if JWT does not match team member', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });

      it('should send 404 if team does not exist', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + (endeavor1.id + 1000))
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });
    });
  });
});

