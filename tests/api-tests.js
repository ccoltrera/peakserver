'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

import app from '../server';

import authTests from './auth-tests';
import usersTests from './users-tests';
import rangesTests from './ranges-tests';

var server;

// Start the server
before((done) => {
  server = app.listen(3000);
  done();
});

// Close the server
after((done) => {
  server.close();
  done();
});

