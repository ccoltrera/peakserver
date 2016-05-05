'use strict';

import Express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

import models from './database/models';
import connection from './database/connection';

import passport from './app/setupPassport';
// connection.drop();
// connection.sync();
var app = Express();

app.use(passport.initialize());

app.get('/auth',
  passport.authenticate(
    'local', {
      session: false
    }),
//  serialize, generateToken, respond);
 (req, res) => {
  res.status(200).json({
    user: req.user
  })
});

app.listen(3000);
