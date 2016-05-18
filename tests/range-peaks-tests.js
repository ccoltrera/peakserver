'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

var address = 'http://localhost:3000/api';

var user1, user2, user1Token, user2Token, range1, range2, peak1, peak3, peak4;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

var userObj1 = {
  email: '1@range-peaks.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

var userObj2 = {
  email: '2@range-peaks.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

var rangeObj1 = {
  name: 'range-peaks.range1'
};

var rangeObj2 = {
  name: 'range-peaks.range2'
};

var peakObj1 = {
  name: 'range-peaks.peak1'
};

var peakObj2 = {
  name: 'range-peaks.peak2'
};

var peakObj3 = {
  name: 'range-peaks.peak3'
};

var peakObj4 = {
  name: 'range-peaks.peak4'
};

// Create users with ranges and peaks needed for tests
before((done) => {
  models.User.create(userObj1)
    .then((user) => {
      user1 = user;
      return models.Range.create(rangeObj1);
    })
    .then((range) => {
      range1 = range;
      var id = range1.id;
      return user1.addRange(id);
    })
    .then(() => {
      return models.RangePeak.create(peakObj1);
    })
    .then((peak) => {
      peak1 = peak;
      var id = peak1.id;
      return range1.addRangePeak(id);
    })
    .then(() => {
      return models.RangePeak.create(peakObj3);
    })
    .then((peak) => {
      peak3 = peak;
      var id = peak3.id;
      return range1.addRangePeak(id);
    })
    .then(() => {
      done();
    });
});

before((done) => {
  models.User.create(userObj2)
    .then((user) => {
      user2 = user;
      return models.Range.create(rangeObj2);
    })
    .then((range) => {
      range2 = range;
      var id = range2.id;
      return user2.addRange(id);
    })
    .then(() => {
      return models.RangePeak.create(peakObj4);
    })
    .then((peak) => {
      peak4 = peak;
      var id = peak4.id;
      return range2.addRangePeak(id);
    })
    .then(() => {
      done();
    });
});

// Generate tokens for tests
before((done) => {
  user1Token = jwt.sign({id: user1.id}, 'server secret', {expiresIn: '120m'});
  user2Token = jwt.sign({id: user2.id}, 'server secret', {expiresIn: '120s'});
  done();
});

// Clean up the database
after((done) => {
  models.User.destroy({where: {email: {$like: '%@range-peaks.com'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Range.destroy({where: {name: {$like: 'range-peaks.range%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.RangePeak.destroy({where: {name: {$like: 'range-peaks.peak%'}}})
  .then(() => {
      done();
    });
});

// /api/users/:user/ranges/:range/peaks
describe('/api/users/:user/ranges/:range/peaks', () => {

  // /api/users/:user/ranges/:range/peaks POST
  describe('POST', () => {

    it('should add a peak to the db and associate it with the range, with a JWT that matches owning user', (done) => {
      chai.request(address)
        .post('/users/' + user2.id + '/ranges/' + range2.id + '/peaks')
        .set('Authorization', 'Bearer ' + user2Token)
        .send(peakObj2)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.eql(peakObj2.name);

          range2.getRangePeaks()
            .then((peaks) => {
              expect(peaks.length).to.eql(2);
              done();
            });
        });
    });

    it('should send a 401 status if the JWT does not match the range owning user', (done) => {
      chai.request(address)
        .post('/users/' + user1.id + '/ranges/' + range1.id + '/peaks')
        .set('Authorization', 'Bearer ' + user2Token)
        .send(peakObj2)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();

        });

    });

    it('should send a 409 status if the peak name same as existing peak on range', (done) => {
      chai.request(address)
        .post('/users/' + user1.id + '/ranges/' + range1.id + '/peaks')
        .set('Authorization', 'Bearer ' + user1Token)
        .send(peakObj1)
        .end((err, res) => {
          expect(res).to.have.status(409);
          done();
        });

    });

  });

  // /api/users/:user/ranges/:range/peaks GET
  describe('GET', () => {

    it('should get all peaks for a given range, with proper JWT', (done) => {
      chai.request(address)
        .get('/users/' + user1.id + '/ranges/' + range1.id + '/peaks')
        .set('Authorization', 'Bearer ' + user1Token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.length).to.eql(2);
          done();
        });
    });

    it('should get send 404 for non existent range', (done) => {
      chai.request(address)
        .get('/users/' + user1.id + '/ranges/' + (range1.id + 1000) + '/peaks')
        .set('Authorization', 'Bearer ' + user1Token)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

  });

  // /api/users/:user/ranges/:range/peaks/:peak
  describe('/:peak', () => {

    describe('GET', () => {

      it('should get a specific peak, with proper JWT', (done) => {
        chai.request(address)
          .get('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + peak1.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.name).to.eql(peak1.name);
            done();
          });
      });

      it('should return a 404 if specific peak / range / user combo does not exist', (done) => {
        chai.request(address)
          .get('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + (peak1.id + 1000))
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });

    });

    describe('POST', () => {

      it('should edit and return a peak, if range owning user matches JWT', (done) => {
        chai.request(address)
          .post('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + peak3.id)
          .set('Authorization', 'Bearer ' + user1Token)
          .send({complete: true})
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.name).to.eql(peak3.name);
            expect(res.body.complete).to.be.ok;

            models.RangePeak.findById(peak3.id)
              .then((peak) => {
                expect(peak.complete).to.be.ok;
                done();
              });
          });
      });

      it('should return a 404 if the peak does not exist', (done) => {
        chai.request(address)
          .post('/users/' + user2.id + '/ranges/' + range2.id + '/peaks/' + peak1.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .send({name: 'range-peaks.peak1.updated'})
          .end((err, res) => {
            expect(res).to.have.status(404);

            models.RangePeak.findById(peak1.id)
              .then((peak) => {
                expect(peak.name).to.eql(peakObj1.name);
                done();
              });
          });

      });

      it('should return 401 if JWT does not match range / peak owning user', (done) => {
        chai.request(address)
          .post('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + peak3.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .send({name: 'range-peaks.peak2.updated'})
          .end((err, res) => {
            expect(res).to.have.status(401);

            models.RangePeak.findById(peak3.id)
              .then((peak) => {
                expect(peak.name).to.eql(peakObj3.name);
                done();
              });
          });
      });

    });

    describe('DELETE', () => {

      it('should delete a peak, if range owning user matches JWT', (done) => {
        chai.request(address)
          .del('/users/' + user2.id + '/ranges/' + range2.id + '/peaks/' + peak4.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(200);

            models.RangePeak.findById(peak4.id)
              .then((peak) => {
                expect(peak).to.not.be.ok;
                done();
              });
          });

      });

      it('should return 404 if the peak does not exist', (done) => {
        chai.request(address)
          .del('/users/' + user2.id + '/ranges/' + range2.id + '/peaks/' + peak1.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(404);

            models.RangePeak.findById(peak1.id)
              .then((peak) => {
                expect(peak.name).to.eql(peakObj1.name);
                done();
              });
          });

      });

      it('should return 401 if JWT does not match range owning user', (done) => {
        chai.request(address)
          .del('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + peak3.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .end((err, res) => {
            expect(res).to.have.status(401);

            models.RangePeak.findById(peak3.id)
              .then((peak) => {
                expect(peak.name).to.eql(peakObj3.name);
                done();
              });
          });

      });

    });
  });

});
