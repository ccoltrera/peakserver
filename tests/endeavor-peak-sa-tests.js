'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

var address = 'http://localhost:3000/api';

var user1, user2,
    user1Token, user2Token,
    org1,
    team1,
    endeavor1,
    peak1, peak2, peak3, peak4, peak5,
    sa1, sa2, sa3;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

// member of org1, member of team1, user of peak1, peak2, peak3, peak4 (for GET, POST, DEL)
var userObj1 = {
  email: '1@endeavor-peak-sa.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// member of org1, member of team1 (for unsuccesful GET, unsuccessful DEL, unsuccessful POST)
var userObj2 = {
  email: '2@endeavor-peak-sa.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

//
var orgObj1 = {
  name: 'endeavor-peak-sa.org1',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

//
var teamObj1 = {
  name: 'endeavor-peak-sa.team1'
};

//
var endeavorObj1 = {
  name: 'endeavor-peak-sa.endeavor1'
};

// used for GET
var peakObj1 = {
  name: 'endeavor-peak-sa.peak1'
};

// used for DEL
var peakObj2 = {
  name: 'endeavor-peak-sa.peak2'
};

// used for edit POST
var peakObj3 = {
  name: 'endeavor-peak-sa.peak3'
};

// used for new POST
var peakObj4 = {
  name: 'endeavor-peak-sa.peak4'
};

// used for GET
var saObj1 = {
  body: 'endeavor-peak-sa.sa1'
};

// used for DEL
var saObj2 = {
  body: 'endeavor-peak-sa.sa2'
};

// used for edit POST
var saObj3 = {
  body: 'endeavor-peak-sa.sa3'
};

// used for new POST
var saObj4 = {
  body: 'endeavor-peak-sa.sa4'
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
    // add user1 and user2 to team1
    .then((team) => {
      team1 = team;
      return team1.addUsers([user1, user2]);
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
    // create peak2
    .then((peak) => {
      peak1 = peak;
      return models.EndeavorPeak.create(peakObj2);
    })
    // create peak3
    .then((peak) => {
      peak2 = peak;
      return models.EndeavorPeak.create(peakObj3);
    })
    // create peak4
    .then((peak) => {
      peak3 = peak;
      return models.EndeavorPeak.create(peakObj4);
    })
    // add peak1, peak2, peak3, and peak4 to endeavor1
    .then((peak) => {
      peak4 = peak;
      return endeavor1.addEndeavorPeaks([peak1, peak2, peak3, peak4]);
    })
    // assign user1 to peak1
    .then(() => {
      return peak1.setUser(user1)
    })
    // assign user1 to peak2
    .then(() => {
      return peak2.setUser(user1)
    })
    // assign user1 to peak3
    .then(() => {
      return peak3.setUser(user1)
    })
    // assign user1 to peak4
    .then(() => {
      return peak4.setUser(user1)
    })
    // create sa1
    .then(() => {
      return models.EndeavorPeakSA.create(saObj1);
    })
    // add sa1 to peak1
    .then((sa) => {
      sa1 = sa;
      return peak1.setEndeavorPeakSA(sa1);
    })
    // create sa2
    .then(() => {
      return models.EndeavorPeakSA.create(saObj2);
    })
    // add sa2 to peak2
    .then((sa) => {
      sa2 = sa;
      return peak2.setEndeavorPeakSA(sa2);
    })
    // create sa3
    .then(() => {
      return models.EndeavorPeakSA.create(saObj3);
    })
    // add sa3 to peak3
    .then((sa) => {
      sa3 = sa;
      return peak3.setEndeavorPeakSA(sa3);
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
  models.User.destroy({where: {email: {$like: '%@endeavor-peak-sa.com'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Organization.destroy({where: {name: {$like: 'endeavor-peak-sa.org%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Team.destroy({where: {name: {$like: 'endeavor-peak-sa.team%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Endeavor.destroy({where: {name: {$like: 'endeavor-peak-sa.endeavor%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.EndeavorPeak.destroy({where: {name: {$like: 'endeavor-peak-sa.peak%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.EndeavorPeakSA.destroy({where: {body: {$like: 'endeavor-peak-sa.sa%'}}})
  .then(() => {
      done();
    });
});

// /orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak/sa
describe('/api/orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peaks/sa', () => {

  // /orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak/sa GET
  describe('GET', () => {
    it('should get specific sa with JWT that matches user', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak1.id + '/sa')
        .set('Authorization', 'Bearer ' + user1Token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.body).to.eql(sa1.body);
          done();
        });
    });

    it('should return 404 status if no matching org / team / endeavor / peak combo', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + (peak1.id + 1000) + '/sa')
        .set('Authorization', 'Bearer ' + user1Token)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('should return 401 status if JWT does not match user', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak1.id + '/sa')
        .set('Authorization', 'Bearer ' + user2Token)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });

  // /orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak/sa POST
  describe('POST', () => {
    it('should edit sa based on JSON, with JWT matching user', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak3.id + '/sa')
        .set('Authorization', 'Bearer ' + user1Token)
        .send({body: 'endeavor-peak-sa.sa3.updated'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.body).to.eql('endeavor-peak-sa.sa3.updated');

          models.EndeavorPeakSA.findById(sa3.id)
            .then((sa) => {
              expect(sa.dataValues.body).to.eql('endeavor-peak-sa.sa3.updated');
              done();
            });
        });
    });

    it('should add sa based on JSON, with JWT matching user', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak4.id + '/sa')
        .set('Authorization', 'Bearer ' + user1Token)
        .send(saObj4)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.body).to.eql(saObj4.body);

          models.EndeavorPeakSA.findOne({where: {body: saObj4.body}})
            .then((sa) => {
              expect(sa.dataValues.body).to.eql(saObj4.body);
              done();
            });
        });
    });

    it('should send 401, when JWT does not match user', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak1.id + '/sa')
        .set('Authorization', 'Bearer ' + user2Token)
        .send({body: 'endeavor-peak-sa.sa1.updated'})
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should send 404, if org / team / endeavor / peak combo does not exist', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + (peak1.id + 1000) + '/sa')
        .set('Authorization', 'Bearer ' + user1Token)
        .send({body: 'endeavor-peak-sa.sa1.updated'})
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  // /orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak/sa DEL
  describe('DELETE', () => {
    it('should destroy a sa, with JWT matching user', (done) => {
      chai.request(address)
        .del('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak2.id + '/sa')
        .set('Authorization', 'Bearer ' + user1Token)
        .end((err, res) => {
          expect(res).to.have.status(200);

          models.EndeavorPeakSA.findOne({where: {body: 'endeavor-peak-sa.sa2'}})
            .then((peak) => {
              expect(peak).to.not.be.ok;
              done();
            });
        });
    });

    it('should send 401 if JWT does not match user', (done) => {
      chai.request(address)
        .del('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak3.id + '/sa')
        .set('Authorization', 'Bearer ' + user2Token)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should send 404 if sa does not exist', (done) => {
      chai.request(address)
        .del('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + (peak1.id + 1000) + '/sa')
        .set('Authorization', 'Bearer ' + user1Token)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

});

