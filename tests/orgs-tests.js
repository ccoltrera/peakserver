'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

var address = 'http://localhost:3000/api';

var user1, user2, user1Token, user2Token;

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

var userObj1 = {
  email: '1@orgs.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

var userObj2 = {
  email: '2@orgs.com',
  password: hashedPassword,
  salt: '$2a$10$somethingheretobeasalt'
};

// Create users needed for tests
before((done) => {
  models.User.create(userObj1)
    .then((user) => {
      user1 = user;
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


// Generate tokens for tests
before((done) => {
  user1Token = jwt.sign({id: user1.id}, 'server secret', {expiresIn: '120m'});
  user2Token = jwt.sign({id: user1.id}, 'server secret', {expiresIn: '120m'});
  done();
});

// Clean up database
after((done) => {
  models.User.destroy({where: {email: {$like: '%@orgs.com'}}})
  .then(() => {
      done();
    });
});

// /orgs
describe('/api/orgs', () => {

  // /orgs POST
  describe('POST', () => {
    it('should create a new org in the db if no matching org exists, with creating user as leader — and return the org', (done) => {
    //   chai.request(address)
    //     .post('/orgs')
    //     .send({email: userObj4.email, password: 'password'})
    //     .end((err, res) => {
    //       expect(res).to.have.status(200);
    //       expect(res.body.email).to.eql('4@orgs.com');
    //       expect(res.body.password).to.eql(null);

    //       models.User.find({where: {email: userObj4.email}})
    //         .then((user) => {
    //           expect(user.dataValues).to.be.ok;
    //           expect(user.dataValues.email).to.eql(userObj4.email);
    //           expect(user.dataValues.salt).to.eql('$2a$10$somethingheretobeasalt');
    //           done();
    //         });
    //     });
    });

    it('send a 409 error if an org with that name already exists', (done) => {
    //   chai.request(address)
    //     .post('/orgs')
    //     .send({email: userObj1.email, password: 'password'})
    //     .end((err, res) => {
    //       expect(res).to.have.status(409);
    //       done();
    //     });
    });

  });

  describe('GET', () => {
    it('should return orgs that match the query string, with proper JWT', (done) => {
    //   chai.request(address)
    //     .get('/orgs')
    //     .set('Authorization', 'Bearer ' + user1Token)
    //     .query({email: {$like: '1@orgs.com'}})
    //     .end((err, res) => {
    //       expect(res).to.have.status(200);
    //       expect(res.body.length).to.eql(1);

    //       done();
    //     });
    });
  });

  // /orgs/:org
  describe('/:org', () => {

    // /orgs/:org GET
    describe('GET', () => {
      it('should get specific org info with proper JWT', (done) => {
      //   chai.request(address)
      //     .get('/orgs/' + user1.id)
      //     .set('Authorization', 'Bearer ' + user1Token)
      //     .end((err, res) => {
      //       expect(res).to.have.status(200);
      //       expect(res.body.email).to.eql(user1.email);
      //       done();
      //     });
      });

      it('should return 404 status if no matching org', (done) => {
      //   chai.request(address)
      //     .get('/orgs/' + (user1.id + 1000) )
      //     .set('Authorization', 'Bearer ' + user1Token)
      //     .end((err, res) => {
      //       expect(res).to.have.status(404);
      //       done();
      //     });
      });
    });

    // /orgs/:org POST
    describe('POST', () => {
      it('should change org info based on JSON, with JWT matching leader, send updated org', (done) => {
      //   chai.request(address)
      //     .post('/orgs/' + user1.id)
      //     .set('Authorization', 'Bearer ' + user1Token)
      //     .send({firstName: 'C', lastName: 'Colt'})
      //     .end((err, res) => {
      //       expect(res).to.have.status(200);
      //       expect(res.body.firstName).to.eql('C');
      //       expect(res.body.password).to.eql(null);

      //       models.User.find({where: {email: userObj1.email}})
      //         .then((user) => {
      //           expect(user.dataValues.firstName).to.eql('C');
      //           expect(user.dataValues.lastName).to.eql('Colt');
      //           done();
      //         });
      //     });
      });

      it('should associate a new user as leader when included in JSON, with JWT matching old leader', (done) => {
      //   chai.request(address)
      //     .post('/orgs/' + user1.id)
      //     .set('Authorization', 'Bearer ' + user1Token)
      //     .send({mentor: user2.id})
      //     .end((err, res) => {
      //       expect(res).to.have.status(200);

      //       user1.getMentor()
      //         .then((mentor) => {
      //           expect(mentor.dataValues.email).to.eql(user2.email);
      //           done();
      //         });
      //     });
      });

      it('should send 401, when JWT does not match leader', (done) => {
      //   chai.request(address)
      //     .post('/orgs/' + user1.id)
      //     .set('Authorization', 'Bearer ' + user1Token)
      //     .send({mentor: user2.id})
      //     .end((err, res) => {
      //       expect(res).to.have.status(200);

      //       user1.getMentor()
      //         .then((mentor) => {
      //           expect(mentor.dataValues.email).to.eql(user2.email);
      //           done();
      //         });
      //     });
      });
    });

    // /orgs/:org DEL
    describe('DELETE', () => {
      it('should delete an org in the db, with JWT matching leader', (done) => {
    //     chai.request(address)
    //       .del('/orgs/' + user3.id)
    //       .set('Authorization', 'Bearer ' + user3Token)
    //       .end((err, res) => {
    //         expect(res).to.have.status(200);

    //         models.User.find({where: {email: '3@orgs.com'}})
    //           .then((user) => {
    //             expect(user).to.not.be.ok;
    //             done();
    //           });
    //       });
      });

      it('should send 401 if attempt is made to delete org where JWT does not match leader', (done) => {
    //     chai.request(address)
    //       .del('/orgs/' + user2.id)
    //       .set('Authorization', 'Bearer ' + user1Token)
    //       .end((err, res) => {
    //         expect(res).to.have.status(401);
    //         done();
    //       });
      });
    });
  });
});

