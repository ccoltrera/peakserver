'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

// import app from '../index';

describe('Peak API', () => {

  var server, userId;

  var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

  // before((done) => {
  //   server = app.listen(3000);
  //   done();
  // });

  before((done) => {
    models.User.findOrCreate({where: {email: 'c@coltrera.com', password: hashedPassword, salt: '$2a$10$somethingheretobeasalt'}})
      .then((users) => {
        userId = users[0].dataValues.id;
        done();
      });
  });

  after((done) => {
    models.User.destroy({where: {email: 'c@coltrera.com'}})
    .then(() => {
        done();
      });
  });

  // after((done) => {
  //   server.close();
  //   done();
  // });

  describe('/auth', () => {

    var properUserInfo = {
      username: 'c@coltrera.com',
      password: 'password'
    }

    var improperUserInfo = {
      username: 'c@coltrera.com',
      password: 'notPassword'
    }

    it('should return a JSON Web Token on proper credentials', function(done) {
          chai.request('http://localhost:3000')
            .get('/auth')
            .query(properUserInfo)
            .end(function(err, res) {
              expect(err).to.eql(null);
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(res.body.token).to.be.ok;

              done();
            });
        });

    it('should reject improper credentials', function(done) {
          chai.request('http://localhost:3000')
            .get('/auth')
            .query(improperUserInfo)
            .end(function(err, res) {
              expect(res).to.have.status(401);
              done();
            });
        });

  });

  describe('/me', () => {

    var generatedToken, expiredToken, badToken;

    before((done) => {

      generatedToken = jwt.sign({id: userId}, 'server secret', {expiresIn: '120m'});

      expiredToken = jwt.sign({id: userId}, 'server secret', {expiresIn: '0s'});

      badToken = jwt.sign({id: userId - 1}, 'server secret', {expiresIn: '120m'});

      done();
    });

    it('should get a user with proper JWT', (done) => {
      chai.request('http://localhost:3000')
        .get('/me')
        .set('Authorization', 'Bearer ' + generatedToken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        })
    });

    it('should reject a user with expired JWT', (done) => {
      chai.request('http://localhost:3000')
        .get('/me')
        .set('Authorization', 'Bearer ' + expiredToken)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        })
    });

    it('should reject a user with JWT from non-existent user', (done) => {
      chai.request('http://localhost:3000')
        .get('/me')
        .set('Authorization', 'Bearer ' + badToken)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        })
    });

  });
});

