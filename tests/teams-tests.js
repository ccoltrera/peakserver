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
    team1, team2, team3, team5, team6;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

// leader of org1
var userObj1 = {
  email: '1@teams.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// member of org1, leader of team1, team2, team3, team5, team6
var userObj2 = {
  email: '2@teams.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// not member of org 1
var userObj3 = {
  email: '3@teams.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// led by user1
var orgObj1 = {
  name: 'teams.org1',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// led by user2, used for GET
var teamObj1 = {
  name: 'teams.team1'
};

// led by user2, used for /teams/:team POST (team leader)
var teamObj2 = {
  name: 'teams.team2'
};

// led by user2, used for /teams/:team DEL (team leader)
var teamObj3 = {
  name: 'teams.team3'
};

// used for /teams POST
var teamObj4 = {
  name: 'teams.team4'
};

// led by user 2, used for /teams/:team POST (org leader)
var teamObj5 = {
  name: 'teams.team4'
};

// led by user2, used for /teams/:team DEL (org leader)
var teamObj6 = {
  name: 'teams.team3'
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
    .then((org) => {
      return org1.addUser(user1);
    })
    // create user2
    .then((org) => {
      return models.User.create(userObj2)
    })
    // add user2 to org1
    .then((user) => {
      user2 = user;
      return org1.addUser(user2);
    })
    // create team1
    .then((org) => {
      return models.Team.create(teamObj1)
    })
    // set user2 as leader of team1
    .then((team) => {
      team1 = team;
      return team1.setLeader(user2);
    })
    // add team to org1
    .then((team) => {
      return org1.addTeam(team);
    })
    // create team2
    .then((org) => {
      return models.Team.create(teamObj2)
    })
    // set user2 as leader of team1
    .then((team) => {
      team2 = team;
      return team2.setLeader(user2);
    })
    // add team to org1
    .then((team) => {
      return org1.addTeam(team);
    })
    // create team3
    .then((org) => {
      return models.Team.create(teamObj3)
    })
    // set user2 as leader of team3
    .then((team) => {
      team3 = team;
      return team.setLeader(user2);
    })
    // add team to org1
    .then((team) => {
      return org1.addTeam(team);
    })
    // create team5
    .then((org) => {
      return models.Team.create(teamObj3)
    })
    // set user2 as leader of team5
    .then((team) => {
      team5 = team;
      return team.setLeader(user2);
    })
    // add team to org1
    .then((team) => {
      return org1.addTeam(team);
    })
    // create team6
    .then((org) => {
      return models.Team.create(teamObj3)
    })
    // set user2 as leader of team6
    .then((team) => {
      team6 = team;
      return team.setLeader(user2);
    })
    // add team to org1
    .then((team) => {
      return org1.addTeam(team);
    })
    .then((org) => {
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
  models.User.destroy({where: {email: {$like: '%@teams.com'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Organization.destroy({where: {name: {$like: 'teams.org%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Team.destroy({where: {name: {$like: 'teams.team%'}}})
  .then(() => {
      done();
    });
});

// /orgs/:org/teams
describe('/api/orgs/:org/teams', () => {

  // /orgs/:org/teams POST
  describe('POST', () => {
    it('should create a new team belonging to org, if user a member, with user as leader and member', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams')
        .set('Authorization', 'Bearer ' + user2Token)
        .send(teamObj4)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.eql(teamObj4.name);

          models.Team.findOne({
            where: {name: teamObj4.name},
            include: [{
              model: models.User,
              as: 'Leader'
            }]
          })
          .then((team) => {
            expect(team).to.be.ok;
            expect(team.dataValues.name).to.eql(teamObj4.name);
            expect(team.Leader.email).to.eql(user2.email);
            return team.getUsers();
          })
          .then((users) => {
            expect(users.length).to.eql(1);
            expect(users[0].dataValues.id).to.eql(user2.id);
            done();
          })
        });
    });

    it('send a 409 error if team with that name already exists for org', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams')
        .set('Authorization', 'Bearer ' + user2Token)
        .send(teamObj1)
        .end((err, res) => {
          expect(res).to.have.status(409);
          done();
        });
    });

    it('send a 401 error if JWT does not match member of org', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams')
        .set('Authorization', 'Bearer ' + user3Token)
        .send(teamObj1)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('send a 404 error if org not found', (done) => {
      chai.request(address)
        .post('/orgs/' + (org1.id + 1000) + '/teams')
        .set('Authorization', 'Bearer ' + user2Token)
        .send(teamObj1)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

  });

  describe('GET', () => {
    it('should return teams in org that match the query string, with JWT that matches org member', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/teams')
        .set('Authorization', 'Bearer ' + user1Token)
        .query({name: {$like: teamObj1.name}})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.length).to.eql(1);

          done();
        });
    });

    it('should return 401, without JWT that matches org member', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/teams')
        .set('Authorization', 'Bearer ' + user3Token)
        .query({name: {$like: teamObj1.name}})
        .end((err, res) => {
          expect(res).to.have.status(401);

          done();
        });
    });

    it('should return 404, if org not found', (done) => {
      chai.request(address)
        .get('/orgs/' + (org1.id + 1000) + '/teams')
        .set('Authorization', 'Bearer ' + user1Token)
        .query({name: {$like: teamObj1.name}})
        .end((err, res) => {
          expect(res).to.have.status(404);

          done();
        });
    });
  });

  // /orgs/:org/teams/:team
  describe('/:team', () => {

    // /orgs/:org/teams/:team GET
    describe('GET', () => {
      it('should get specific team info with JWT that matches org member', (done) => {
        chai.request(address)
          .get('/orgs/' + org1.id + '/teams/' + team1.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.name).to.eql(team1.name);
            done();
          });
      });

      it('should return 404 status if no matching team', (done) => {
        chai.request(address)
          .get('/orgs/' + org1.id + '/teams/' + (team1.id + 1000) )
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });

      it('should return 401 status if JWT does not match org member', (done) => {
        chai.request(address)
          .get('/orgs/' + org1.id + '/teams/' + team1.id)
          .set('Authorization', 'Bearer ' + user3Token)
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });
    });

    // /orgs/:org/teams/:team POST
    describe('POST', () => {
      it('should change team info based on JSON, with JWT matching team leader, send updated team', (done) => {
        chai.request(address)
          .post('/orgs/' + org1.id + '/teams/' + team2.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .send({name: 'teams.team2.updated', leader: user1.id})
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.name).to.eql('teams.team2.updated');

            models.Team.findById(team2.id)
              .then((team) => {
                expect(team.dataValues.name).to.eql('teams.team2.updated');
                return team.getLeader();
              })
              .then((leader) => {
                expect(leader.dataValues.email).to.eql(user1.email);
                done();
              });
          });
      });

      it('should change team info based on JSON, with JWT matching org leader, send updated team', (done) => {
        chai.request(address)
          .post('/orgs/' + org1.id + '/teams/' + team5.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .send({name: 'teams.team5.updated', leader: user1.id})
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.name).to.eql('teams.team5.updated');

            models.Team.findById(team5.id)
              .then((team) => {
                expect(team.dataValues.name).to.eql('teams.team5.updated');
                return team.getLeader();
              })
              .then((leader) => {
                expect(leader.dataValues.email).to.eql(user1.email);
                done();
              });
          });
      });

      it('should send 401, when JWT does not match team or org leader', (done) => {
        chai.request(address)
          .post('/orgs/' + org1.id + '/teams/' + team1.id)
          .set('Authorization', 'Bearer ' + user3Token)
          .send({name: 'teams.org2.updated'})
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });

      it('should send 404, if team does not exist', (done) => {
        chai.request(address)
          .post('/orgs/' + org1.id + '/teams/' + (team1.id + 1000))
          .set('Authorization', 'Bearer ' + user2Token)
          .send({name: 'teams.org2.updated'})
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });
    });

    // /orgs/:org/teams/:team DEL
    describe('DELETE', () => {
      it('should delete a team in the db, with JWT matching team leader', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id + '/teams/' + team3.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(200);

            models.Organization.findOne({where: {name: 'teams.team3'}})
              .then((org) => {
                expect(org).to.not.be.ok;
                done();
              });
          });
      });

      it('should delete a team in the db, with JWT matching org leader', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id + '/teams/' + team6.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(200);

            models.Organization.findOne({where: {name: 'teams.team6'}})
              .then((org) => {
                expect(org).to.not.be.ok;
                done();
              });
          });
      });

      it('should send 401 if attempt is made to delete team where JWT does not match org or team leader', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id + '/teams/' + team1.id)
          .set('Authorization', 'Bearer ' + user3Token)
          .end((err, res) => {
            expect(res).to.have.status(401);
            done();
          });
      });

      it('should send 404 if team does not exist', (done) => {
        chai.request(address)
          .del('/orgs/' + org1.id + '/teams/' + (team1.id + 1000))
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });
    });
  });
});

