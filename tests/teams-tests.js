'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

var address = 'http://localhost:3000/api';

var user1, user2, user3, user1Token, user2Token, user3Token, org1, org2, org3;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

// leader of org1
var userObj1 = {
  email: '1@teams.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// leader of team1, team2, team3
var userObj2 = {
  email: '2@teams.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

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

// used for GET
var teamObj1 = {
  name: 'teams.team1'
};

// used for /teams/:team POST
var teamObj2 = {
  name: 'teams.team2'
};

// used for /teams/:team DEL
var teamObj3 = {
  name: 'teams.team3'
};

// used for /teams POST
var teamObj4 = {
  name: 'teams.team4'
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
    it('should create a new team belonging to org, if user a member, with user as leader', (done) => {
      // chai.request(address)
      //   .post('/orgs/:org/teams')
      //   .set('Authorization', 'Bearer ' + user2Token)
      //   .send(orgObj4)
      //   .end((err, res) => {
      //     expect(res).to.have.status(200);
      //     expect(res.body.name).to.eql(orgObj4.name);

      //     models.Organization.findOne({where: {name: orgObj4.name}})
      //       .then((org) => {
      //         expect(org).to.be.ok;
      //         expect(org.dataValues.name).to.eql(orgObj4.name);

      //         return org.getLeader();
      //       })
      //       .then((leader) => {
      //         expect(leader.email).to.eql(user2.email);
      //         done();
      //       });
      //   });
    });

    it('send a 409 error if team with that name already exists for org', (done) => {
      // chai.request(address)
      //   .post('/orgs/:org/teams')
      //   .set('Authorization', 'Bearer ' + user2Token)
      //   .send(orgObj1)
      //   .end((err, res) => {
      //     expect(res).to.have.status(409);
      //     done();
      //   });
    });

    it('send a 401 error if JWT does not match member of org', (done) => {
      // chai.request(address)
      //   .post('/orgs/:org/teams')
      //   .set('Authorization', 'Bearer ' + user2Token)
      //   .send(orgObj1)
      //   .end((err, res) => {
      //     expect(res).to.have.status(401);
      //     done();
      //   });
    });

    it('send a 404 error if org not found', (done) => {
      // chai.request(address)
      //   .post('/orgs/:org/teams')
      //   .set('Authorization', 'Bearer ' + user2Token)
      //   .send(orgObj1)
      //   .end((err, res) => {
      //     expect(res).to.have.status(404);
      //     done();
      //   });
    });

  });

  describe('GET', () => {
    it('should return teams in org that match the query string, with JWT that matches org member', (done) => {
      // chai.request(address)
      //   .get('/orgs/:org/teams')
      //   .set('Authorization', 'Bearer ' + user1Token)
      //   .query({name: {$like: orgObj1.name}})
      //   .end((err, res) => {
      //     expect(res).to.have.status(200);
      //     expect(res.body.length).to.eql(1);

      //     done();
      //   });
    });

    it('should return 401, without JWT that matches org member', (done) => {
      // chai.request(address)
      //   .get('/orgs/:org/teams')
      //   .set('Authorization', 'Bearer ' + user1Token)
      //   .query({name: {$like: orgObj1.name}})
      //   .end((err, res) => {
      //     expect(res).to.have.status(200);
      //     expect(res.body.length).to.eql(1);

      //     done();
      //   });
    });
  });

  // /orgs/:org/teams/:team
  describe('/:team', () => {

    // /orgs/:org/teams/:team GET
    describe('GET', () => {
      it('should get specific org info with JWT that matches org member', (done) => {
        // chai.request(address)
        //   .get('/orgs/:org/teams/' + org1.id)
        //   .set('Authorization', 'Bearer ' + user1Token)
        //   .end((err, res) => {
        //     expect(res).to.have.status(200);
        //     expect(res.body.name).to.eql(org1.name);
        //     done();
        //   });
      });

      it('should return 404 status if no matching org', (done) => {
        // chai.request(address)
        //   .get('/orgs/:org/teams/' + (org1.id + 1000) )
        //   .set('Authorization', 'Bearer ' + user1Token)
        //   .end((err, res) => {
        //     expect(res).to.have.status(404);
        //     done();
        //   });
      });

      it('should return 401 status if JWT does not match org member', (done) => {
        // chai.request(address)
        //   .get('/orgs/:org/teams/' + (org1.id + 1000) )
        //   .set('Authorization', 'Bearer ' + user1Token)
        //   .end((err, res) => {
        //     expect(res).to.have.status(404);
        //     done();
        //   });
      });
    });

    // /orgs/:org/teams/:team POST
    describe('POST', () => {
      it('should change team info based on JSON, with JWT matching team leader, send updated team', (done) => {
      //   chai.request(address)
      //     .post('/orgs/:org/teams/' + org2.id)
      //     .set('Authorization', 'Bearer ' + user1Token)
      //     .send({name: 'teams.org2.updated', leader: user2.id})
      //     .end((err, res) => {
      //       expect(res).to.have.status(200);
      //       expect(res.body.name).to.eql('teams.org2.updated');

      //       models.Organization.findById(org2.id)
      //         .then((org) => {
      //           expect(org.dataValues.name).to.eql('teams.org2.updated');
      //           return org.getLeader();
      //         })
      //         .then((leader) => {
      //           expect(leader.dataValues.email).to.eql(user2.email);
      //           done();
      //         });
      //     });
      });

      it('should change team info based on JSON, with JWT matching org leader, send updated team', (done) => {
      //   chai.request(address)
      //     .post('/orgs/:org/teams/' + org2.id)
      //     .set('Authorization', 'Bearer ' + user1Token)
      //     .send({name: 'teams.org2.updated', leader: user2.id})
      //     .end((err, res) => {
      //       expect(res).to.have.status(200);
      //       expect(res.body.name).to.eql('teams.org2.updated');

      //       models.Organization.findById(org2.id)
      //         .then((org) => {
      //           expect(org.dataValues.name).to.eql('teams.org2.updated');
      //           return org.getLeader();
      //         })
      //         .then((leader) => {
      //           expect(leader.dataValues.email).to.eql(user2.email);
      //           done();
      //         });
      //     });
      });

      it('should send 401, when JWT does not match team or org leader', (done) => {
        // chai.request(address)
        //   .post('/orgs/:org/teams/' + org1.id)
        //   .set('Authorization', 'Bearer ' + user2Token)
        //   .send({name: 'teams.org2.updated'})
        //   .end((err, res) => {
        //     expect(res).to.have.status(401);
        //     done();
        //   });
      });

      it('should send 404, if team does not exist', (done) => {
        // chai.request(address)
        //   .post('/orgs/:org/teams/' + (org1.id + 1000))
        //   .set('Authorization', 'Bearer ' + user2Token)
        //   .send({name: 'teams.org2.updated'})
        //   .end((err, res) => {
        //     expect(res).to.have.status(404);
        //     done();
        //   });
      });
    });

    // /orgs/:org/teams/:team DEL
    describe('DELETE', () => {
      it('should delete a team in the db, with JWT matching team leader', (done) => {
      //   chai.request(address)
      //     .del('/orgs/:org/teams/' + org3.id)
      //     .set('Authorization', 'Bearer ' + user2Token)
      //     .end((err, res) => {
      //       expect(res).to.have.status(200);

      //       models.Organization.findOne({where: {name: 'teams.org3'}})
      //         .then((org) => {
      //           expect(org).to.not.be.ok;
      //           done();
      //         });
      //     });
      });

      it('should delete a team in the db, with JWT matching org leader', (done) => {
      //   chai.request(address)
      //     .del('/orgs/:org/teams/' + org3.id)
      //     .set('Authorization', 'Bearer ' + user2Token)
      //     .end((err, res) => {
      //       expect(res).to.have.status(200);

      //       models.Organization.findOne({where: {name: 'teams.org3'}})
      //         .then((org) => {
      //           expect(org).to.not.be.ok;
      //           done();
      //         });
      //     });
      });

      it('should send 401 if attempt is made to delete team where JWT does not match org or team leader', (done) => {
        // chai.request(address)
        //   .del('/orgs/:org/teams/' + org1.id)
        //   .set('Authorization', 'Bearer ' + user2Token)
        //   .end((err, res) => {
        //     expect(res).to.have.status(401);
        //     done();
        //   });
      });

      it('should send 404 if team does not exist', (done) => {
        // chai.request(address)
        //   .del('/orgs/:org/teams/' + org1.id)
        //   .set('Authorization', 'Bearer ' + user2Token)
        //   .end((err, res) => {
        //     expect(res).to.have.status(401);
        //     done();
        //   });
      });
    });
  });
});

