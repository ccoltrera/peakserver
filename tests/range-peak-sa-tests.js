'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
chai.use(require('chai-datetime'));
var expect = chai.expect;

import models from '../database/models';

var address = 'http://localhost:3000/api';

var user1, user2, user1Token, user2Token, range1, peak1, peak2, peak3, peak4, peak5, sa1, sa3, sa4;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

var userObj1 = {
  email: '1@range-peak-sa.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

var userObj2 = {
  email: '2@range-peak-sa.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

var userObj3 = {
  email: '3@range-peak-sa.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

var rangeObj1 = {
  name: 'range-peak-sa.range1'
};

var peakObj1 = {
  name: 'range-peak-sa.peak1'
};

var peakObj2 = {
  name: 'range-peak-sa.peak2'
};

var peakObj3 = {
  name: 'range-peak-sa.peak3'
};

var peakObj4 = {
  name: 'range-peak-sa.peak4'
};

var peakObj5 = {
  name: 'range-peak-sa.peak5'
};

var peakSAObj1 = {
  body: 'range-peak-sa.sa1'
};

var peakSAObj2 = {
  body: 'range-peak-sa.sa2'
};

var peakSAObj3 = {
  body: 'range-peak-sa.sa3'
};

var peakSAObj4 = {
  body: 'range-peak-sa.sa4'
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
      return models.RangePeak.create(peakObj2);
    })
    .then((peak) => {
      peak2 = peak;
      var id = peak2.id;
      return range1.addRangePeak(id);
    })
    .then(() => {
      return models.RangePeakSA.create(peakSAObj1);
    })
    .then((sa) => {
      sa1 = sa;
      var id = sa1.id;
      return peak1.setRangePeakSA(id);
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
      return models.RangePeakSA.create(peakSAObj3);
    })
    .then((sa) => {
      sa3 = sa;
      var id = sa3.id;
      return peak3.setRangePeakSA(id);
    })
    .then(() => {
      return models.RangePeak.create(peakObj4);
    })
    .then((peak) => {
      peak4 = peak;
      var id = peak4.id;
      return range1.addRangePeak(id);
    })
    .then(() => {
      return models.RangePeakSA.create(peakSAObj4);
    })
    .then((sa) => {
      sa4 = sa;
      var id = sa4.id;
      return peak4.setRangePeakSA(id);
    })
    .then(() => {
      return models.RangePeak.create(peakObj5);
    })
    .then((peak) => {
      peak5 = peak;
      var id = peak5.id;
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
      return user1.setMentor(user2);
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
  models.User.destroy({where: {email: {$like: '%@range-peak-sa.com'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.Range.destroy({where: {name: {$like: 'range-peak-sa.range%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.RangePeak.destroy({where: {name: {$like: 'range-peak-sa.peak%'}}})
  .then(() => {
      done();
    });
});

after((done) => {
  models.RangePeakSA.destroy({where: {body: {$like: 'range-peak-sa.sa%'}}})
  .then(() => {
      done();
    });
});

// /api/users/:user/ranges/:range/peaks/:peak/sa
describe('/api/users/:user/ranges/:range/peaks/:peak/sa', () => {

  // /api/users/:user/ranges/:range/peaks/:peak/sa GET
  describe('GET', () => {

    it('should get sa for a specific peak, with proper JWT', (done) => {
        chai.request(address)
          .get('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + peak1.id + '/sa')
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.body).to.eql(sa1.body);
            done();
          });
      });

      it('should return a 404 if specific peak / range / user combo does not exist', (done) => {
        chai.request(address)
          .get('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + (peak1.id + 1000) + '/sa')
          .set('Authorization', 'Bearer ' + user1Token)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });

  });

  // /api/users/:user/ranges/:range/peaks/:peak/sa POST
  describe('POST', () => {
    it('should edit and return sa, if range owning user matches JWT', (done) => {
      chai.request(address)
        .post('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + peak4.id + '/sa')
        .set('Authorization', 'Bearer ' + user1Token)
        .send({body: 'range-peak-sa.sa4.updated'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.body).to.eql('range-peak-sa.sa4.updated');

          models.RangePeakSA.findById(sa4.id)
            .then((sa) => {
              expect(sa.body).to.eql('range-peak-sa.sa4.updated');
              done();
            });
        });
    });

    it('should add and return new sa, if range owning user matches JWT', (done) => {
      chai.request(address)
        .post('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + peak2.id + '/sa')
        .set('Authorization', 'Bearer ' + user1Token)
        .send(peakSAObj2)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.body).to.eql(peakSAObj2.body);

          models.RangePeakSA.findById(res.body.id)
            .then((sa) => {
              expect(sa.body).to.eql(peakSAObj2.body);
              done();
            });
        });
    });

    it('should return a 404 if the peak does not exist', (done) => {
      chai.request(address)
        .post('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + (peak1.id + 1000) + '/sa')
        .set('Authorization', 'Bearer ' + user1Token)
        .send({body: 'range-peak-sa.sa1.updated'})
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });

    });

    it('should return 401 if JWT does not match range / peak owning user\'s mentor', (done) => {
      chai.request(address)
        .post('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + peak1.id + '/sa')
        .set('Authorization', 'Bearer ' + user2Token)
        .send({body: 'range-peak-sa.sa1.updated'})
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });


  });

  // /api/users/:user/ranges/:range/peaks/:peak/sa DELETE
  describe('DELETE', () => {

    it('delete sa, if range owning user matches JWT', (done) => {
      chai.request(address)
        .del('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + peak3.id + '/sa')
        .set('Authorization', 'Bearer ' + user1Token)
        .end((err, res) => {
          expect(res).to.have.status(200);

          models.RangePeakSA.findById(sa3.id)
            .then((sa) => {
              expect(sa).to.not.be.ok;
              done();
            });
        });
    });

    it('should return a 404 if the peak does not exist', (done) => {
      chai.request(address)
        .del('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + (peak1.id + 1000) + '/sa')
        .set('Authorization', 'Bearer ' + user1Token)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });

    });

    it('should return a 404 if there is no feedback', (done) => {
      chai.request(address)
        .del('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + peak5.id + '/sa')
        .set('Authorization', 'Bearer ' + user1Token)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });

    });

    it('should return 401 if JWT does not match range / peak owning user', (done) => {
      chai.request(address)
        .del('/users/' + user1.id + '/ranges/' + range1.id + '/peaks/' + peak1.id + '/sa')
        .set('Authorization', 'Bearer ' + user2Token)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

  });

});
