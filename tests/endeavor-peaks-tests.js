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
    endeavor1,
    peak1, peak3, peak4;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

// member of org1, member of team1 (for POST, DEL)
var userObj1 = {
  email: '1@peaks.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// member of org1 (for GET, unsuccessful POST and DEL)
var userObj2 = {
  email: '2@peaks.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// not member of org 1 (for unsuccessful GET)
var userObj3 = {
  email: '3@peaks.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

//
var orgObj1 = {
  name: 'peaks.org1',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

//
var teamObj1 = {
  name: 'peaks.team1'
};

//
var endeavorObj1 = {
  name: 'peaks.endeavor1'
};

// used for GET
var peakObj1 = {
  name: 'peaks.peak1'
};

// used for /peaks POST
var peakObj2 = {
  name: 'peaks.peak2',
};

// used for /peaks/:peak POST
var peakObj3 = {
  name: 'peaks.peak3'
};

// used for /peaks/:peak DEL
var peakObj4 = {
  name: 'peaks.peak4'
};

// used for /peaks unsuccessful POST
var peakObj5 = {
  name: 'peaks.peak5'
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
      peakObj2.user = user.id;
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
    // add endeavor1 to team1
    .then((endeavor) => {
      endeavor1 = endeavor;
      return team1.addEndeavor(endeavor1);
    })
    // create peak1
    .then(() => {
      return models.EndeavorPeak.create(peakObj1);
    })
    // create peak3
    .then((peak) => {
      peak1 = peak;
      return models.EndeavorPeak.create(peakObj3);
    })
    .then((peak) => {
      peak3 = peak;
      return models.EndeavorPeak.create(peakObj4);
    })
    // add peak1, peak3, and peak4 to team1
    .then((peak) => {
      peak4 = peak;
      return endeavor1.addEndeavorPeaks([peak1, peak3, peak4]);
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
  models.User.destroy({where: {email: {$like: '%@peaks.com'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Organization.destroy({where: {name: {$like: 'peaks.org%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Team.destroy({where: {name: {$like: 'peaks.team%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Endeavor.destroy({where: {name: {$like: 'peaks.endeavor%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.EndeavorPeak.destroy({where: {name: {$like: 'peaks.peak%'}}})
  .then(() => {
      done();
    });
});

// /orgs/:org/teams/:team/endeavors/:endeavor/peaks
describe('/api/orgs/:org/teams/:team/endeavors/:endeavor/peaks', () => {

  // /orgs/:org/teams/:team/endeavors/:endeavor/peaks GET
  describe('GET', () => {
    it('should return an endeavor\'s peaks that match query, with JWT that matches org member', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks')
        .set('Authorization', 'Bearer ' + user2Token)
        .query({name: {$like: peakObj1.name}})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.length).to.eql(1);
          expect(res.body[0].name).to.eql(peakObj1.name);

          done();
        });
    });

    it('should return 401, without JWT that matches org member', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks')
        .set('Authorization', 'Bearer ' + user3Token)
        .query({name: {$like: peakObj1.name}})
        .end((err, res) => {
          expect(res).to.have.status(401);

          done();
        });
    });

    it('should return 404, if org / team / endeavor combo not found', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + (endeavor1.id  + 1000) + '/peaks')
        .set('Authorization', 'Bearer ' + user1Token)
        .query({name: {$like: endeavorObj1.name}})
        .end((err, res) => {
          expect(res).to.have.status(404);

          done();
        });
    });
  });

  // /orgs/:org/teams/:team/endeavors/:endeavor/peaks POST
  describe('POST', () => {
    it('should create a new peak belonging to endeavor, if user a member', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks')
        .set('Authorization', 'Bearer ' + user1Token)
        .send(peakObj2)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.eql(peakObj2.name);

          models.Organization.findOne({
            where: {id: org1.id},
            include: [{
              model: models.Team,
              where: {id: team1.id},
              include: [{
                model: models.Endeavor,
                where: {id: endeavor1.id},
                include: [{
                  model: models.EndeavorPeak,
                  where: {name: peakObj2.name}
                }]
              }]
            }]
          })
          .then((org) => {
            let peak = org.Teams[0].Endeavors[0].EndeavorPeaks[0];
            expect(org).to.be.ok;
            expect(peak.dataValues.name).to.eql(peakObj2.name);
            peak.getUser()
              .then((user) => {
                expect(user.email).to.eql(user2.email);
                peak.getCreator()
                  .then((creator) => {
                    expect(creator.email).to.eql(user1.email);
                    done();
                  })
              })
          })
        });
    });

    it('send a 409 error if peak with that name already exists for team', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks')
        .set('Authorization', 'Bearer ' + user1Token)
        .send(peakObj1)
        .end((err, res) => {
          expect(res).to.have.status(409);
          done();
        });
    });

    it('send a 401 error if JWT does not match member of team', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks')
        .set('Authorization', 'Bearer ' + user2Token)
        .send(peakObj5)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

  });

  // /orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak
  describe('/:peak', () => {

    // /orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak GET
    describe('GET', () => {
      it('should get specific peak info with JWT that matches org member', (done) => {
        chai.request(address)
          .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak1.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.name).to.eql(peak1.name);
            done();
          });
      });

      it('should return 404 status if no matching org / team / endeavor / peak combo', (done) => {
        chai.request(address)
          .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + (peak1.id + 1000))
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });

      it('should return 401 status if JWT does not match org member', (done) => {
        chai.request(address)
          .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak1.id)
          .set('Authorization', 'Bearer ' + user3Token)
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });
    });

    // /orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak POST
    describe('POST', () => {
      it('should change peak info based on JSON, with JWT matching team member, send updated peak', (done) => {
        chai.request(address)
          .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak3.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .send({name: 'peaks.peak3.updated', complete: true, user: user1.id})
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.name).to.eql('peaks.peak3.updated');

            models.EndeavorPeak.findById(peak3.id)
              .then((peak) => {
                expect(peak.dataValues.name).to.eql('peaks.peak3.updated');
                expect(peak.dataValues.complete).to.eql(true);
                peak.getUser()
                  .then((user) => {
                    expect(user.email).to.eql(user1.email);
                    done();
                  })
              });
          });
      });

      it('should send 401, when JWT does not match team member', (done) => {
        chai.request(address)
          .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak1.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .send({name: 'peaks.peak1.updated'})
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });

      it('should send 404, if org / team / endeavor combo does not exist', (done) => {
        chai.request(address)
          .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + (peak1.id + 1000))
          .set('Authorization', 'Bearer ' + user1Token)
          .send({name: 'peaks.peak1.updated'})
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });
    });

    // /orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak DEL
    describe('DELETE', () => {
      it('should destroy an endeavor in the db, with JWT matching team member', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak4.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(200);

            models.EndeavorPeak.findOne({where: {name: 'peaks.peak4'}})
              .then((peak) => {
                expect(peak).to.not.be.ok;
                done();
              });
          });
      });

      it('should send 401 if JWT does not match team member', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak1.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });

      it('should send 404 if peak does not exist', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + (peak1.id + 1000))
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });
    });
  });
});

