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
    peak1, peak2, peak3, peak4, peak5,
    fb1, fb2, fb3;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

// member of org1, member of team1 (for edit POST, DEL), giver of fb3
var userObj1 = {
  email: '1@endeavor-peak-fb.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// member of org1, member of team1 (for GET, unsuccessful DEL, new POST, unsuccessful edit POST)
var userObj2 = {
  email: '2@endeavor-peak-fb.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// member of org 1 (for unsuccessful GET, unsuccessful POST)
var userObj3 = {
  email: '3@endeavor-peak-fb.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

//
var orgObj1 = {
  name: 'endeavor-peak-fb.org1',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

//
var teamObj1 = {
  name: 'endeavor-peak-fb.team1'
};

//
var endeavorObj1 = {
  name: 'endeavor-peak-fb.endeavor1'
};

// used for GET
var peakObj1 = {
  name: 'endeavor-peak-fb.peak1'
};

// used for DEL
var peakObj2 = {
  name: 'endeavor-peak-fb.peak2'
};

// used for edit POST
var peakObj3 = {
  name: 'endeavor-peak-fb.peak3'
};

// used for new POST
var peakObj4 = {
  name: 'endeavor-peak-fb.peak4'
};

// used for unsuccessful new POST
var peakObj5 = {
  name: 'endeavor-peak-fb.peak5'
};

// used for GET
var fbObj1 = {
  body: 'endeavor-peak-fb.fb1'
};

// used for DEL, giver: user1
var fbObj2 = {
  body: 'endeavor-peak-fb.fb2'
};

// used for edit POST, giver: user1
var fbObj3 = {
  body: 'endeavor-peak-fb.fb3'
};

// used for new POST
var fbObj4 = {
  body: 'endeavor-peak-fb.fb4'
};

// used for unsuccessful new POST
var fbObj5 = {
  body: 'endeavor-peak-fb.fb5'
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
      return models.User.create(userObj2);
    })
    // create user3
    .then((user) => {
      user2 = user;
      return models.User.create(userObj3);
    })
    // add user1, user2, and user3 to org1
    .then((user) => {
      user3 = user;
      return org1.addUsers([user1, user2, user3]);
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
    // create peak5
    .then((peak) => {
      peak4 = peak;
      return models.EndeavorPeak.create(peakObj5);
    })
    // add peak1, peak2, and peak3 to endeavor1
    .then((peak) => {
      peak5 = peak;
      return endeavor1.addEndeavorPeaks([peak1, peak2, peak3, peak4, peak5]);
    })
    // create fb1
    .then(() => {
      return models.EndeavorPeakFB.create(fbObj1);
    })
    // add fb1 to peak1
    .then((fb) => {
      fb1 = fb;
      return peak1.setEndeavorPeakFB(fb1);
    })
    // create fb2
    .then(() => {
      return models.EndeavorPeakFB.create(fbObj2);
    })
    // add fb2 to peak2
    .then((fb) => {
      fb2 = fb;
      return peak2.setEndeavorPeakFB(fb2);
    })
    // set fb2 giver to user1
    .then(() => {
      return fb2.setGiver(user1);
    })
    // create fb3
    .then(() => {
      return models.EndeavorPeakFB.create(fbObj3);
    })
    // add fb3 to peak3
    .then((fb) => {
      fb3 = fb;
      return peak3.setEndeavorPeakFB(fb3);
    })
    // set fb2 giver to user1
    .then(() => {
      return fb3.setGiver(user1);
    })
    .then(() => {
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
  models.User.destroy({where: {email: {$like: '%@endeavor-peak-fb.com'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Organization.destroy({where: {name: {$like: 'endeavor-peak-fb.org%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Team.destroy({where: {name: {$like: 'endeavor-peak-fb.team%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Endeavor.destroy({where: {name: {$like: 'endeavor-peak-fb.endeavor%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.EndeavorPeak.destroy({where: {name: {$like: 'endeavor-peak-fb.peak%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.EndeavorPeakFB.destroy({where: {body: {$like: 'endeavor-peak-fb.fb%'}}})
  .then(() => {
      done();
    });
});

// /orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak/fb
describe('/api/orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peaks/fb', () => {

  // /orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak/fb GET
  describe('GET', () => {
    it('should get specific fb with JWT that matches team member', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak1.id + '/fb')
        .set('Authorization', 'Bearer ' + user2Token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.body).to.eql(fb1.body);
          done();
        });
    });

    it('should return 404 status if no matching org / team / endeavor / peak combo', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + (peak1.id + 1000) + '/fb')
        .set('Authorization', 'Bearer ' + user2Token)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('should return 401 status if JWT does not match team member', (done) => {
      chai.request(address)
        .get('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak1.id + '/fb')
        .set('Authorization', 'Bearer ' + user3Token)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });

  // /orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak/fb POST
  describe('POST', () => {
    it('should edit fb based on JSON, with JWT matching giver', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak3.id + '/fb')
        .set('Authorization', 'Bearer ' + user1Token)
        .send({body: 'endeavor-peak-fb.fb3.updated'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.body).to.eql('endeavor-peak-fb.fb3.updated');

          models.EndeavorPeakFB.findById(fb3.id)
            .then((fb) => {
              expect(fb.dataValues.body).to.eql('endeavor-peak-fb.fb3.updated');
              fb.getGiver()
                .then((giver) => {
                  expect(giver.email).to.eql(user1.email);
                  done();
                })
            });
        });
    });

    it('should add fb based on JSON, with JWT matching team member', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak4.id + '/fb')
        .set('Authorization', 'Bearer ' + user2Token)
        .send(fbObj4)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.body).to.eql(fbObj4.body);

          models.EndeavorPeakFB.findOne({where: {body: fbObj4.body}})
            .then((fb) => {
              expect(fb.dataValues.body).to.eql(fbObj4.body);
              fb.getGiver()
                .then((giver) => {
                  expect(giver.email).to.eql(user2.email);
                  done();
                })
            });
        });
    });

    it('should send 401, when JWT does not match team member (for new fb)', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak5.id + '/fb')
        .set('Authorization', 'Bearer ' + user3Token)
        .send(fbObj5)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should send 409, when JWT does not match giver (for old fb)', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak3.id + '/fb')
        .set('Authorization', 'Bearer ' + user2Token)
        .send(fbObj5)
        .end((err, res) => {
          expect(res).to.have.status(409);
          done();
        });
    });

    it('should send 404, if org / team / endeavor / peak combo does not exist', (done) => {
      chai.request(address)
        .post('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + (peak1.id + 1000) + '/fb')
        .set('Authorization', 'Bearer ' + user1Token)
        .send(fbObj5)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  // /orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak/fb DEL
  describe('DELETE', () => {
    it('should destroy a fb, with JWT matching giver', (done) => {
      chai.request(address)
        .del('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak2.id + '/fb')
        .set('Authorization', 'Bearer ' + user1Token)
        .end((err, res) => {
          expect(res).to.have.status(200);

          models.EndeavorPeakFB.findOne({where: {body: 'endeavor-peak-fb.fb2'}})
            .then((peak) => {
              expect(peak).to.not.be.ok;
              done();
            });
        });
    });

    it('should send 401 if JWT does not match giver', (done) => {
      chai.request(address)
        .del('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + peak3.id + '/fb')
        .set('Authorization', 'Bearer ' + user2Token)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should send 404 if fb does not exist', (done) => {
      chai.request(address)
        .del('/orgs/' + org1.id + '/teams/' + team1.id + '/endeavors/' + endeavor1.id + '/peaks/' + (peak1.id + 1000) + '/fb')
        .set('Authorization', 'Bearer ' + user1Token)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

});

