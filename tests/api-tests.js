'use strict';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
var expect = chai.expect;

import models from '../database/models';

import app from '../server';

import userTests from './user-tests';
import authTests from './auth-tests';

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

