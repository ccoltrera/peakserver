'use strict';

var Express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

var jwtAuthenticate = expressJwt({secret : 'server secret'});

var models = require('./database/models');
var connection = require('./database/connection');

var passport = require('./app/setupPassport');
var generateToken = require('./app/generateToken');

// connection.drop();
// connection.sync();
var app = Express();

app.use(passport.initialize());

app.get('/auth',
  passport.authenticate(
    'local', {
      session: false
    }), //  serialize,
  generateToken, (req, res) => {

  res.status(200).json({
    user: req.user,
    token: req.token
  });

});

app.get('/me', jwtAuthenticate, (req, res) => {

  models.User.findOne({where: {id: req.user.id}})
    .then((user) => {
      if (user == null) {
        res.sendStatus(401);
      }
      else {
        res.status(200).json(user);
      }
    });

});

app.listen(3000);

console.log('Listening on port 3000');
