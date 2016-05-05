'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';

import models from '../database/models';

chai.use(chaiHttp);
var expect = chai.expect;

// import the server
import server from '../index';

var properUserInfo = {
  username: 'c@coltrera.com',
  password: 'password'
}

var improperUserInfo = {
  username: 'c@coltrera.com',
  password: 'notPassword'
}

var hashedPassword = bcrypt.hashSync('password', '$2a$10$somethingheretobeasalt');

describe('/auth', () => {
  before((done) => {
    models.User.findOrCreate({where: {email: 'c@coltrera.com', password: hashedPassword, salt: '$2a$10$somethingheretobeasalt'}})
      .then(() => {
        done();
      });
  });

  after((done) => {
    models.User.destroy({where: {email: 'c@coltrera.com'}})
    .then(() => {
        done();
      });
  });

  it("should return a JSON Web Token on proper credentials", function(done) {
        chai.request("http://localhost:3000")
          .get("/auth")
          .query(properUserInfo)
          .end(function(err, res) {
            expect(err).to.eql(null);
            expect(res).to.have.status(200);
            done();
          });
      });

  it("should reject iproper credentials", function(done) {
        chai.request("http://localhost:3000")
          .get("/auth")
          .query(improperUserInfo)
          .end(function(err, res) {
            // expect(err).to.eql(null);
            expect(res).to.have.status(401);
            done();
          });
      });

});
