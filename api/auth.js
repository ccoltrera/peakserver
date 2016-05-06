'use strict';

var passport = require('../auth/passportStrategy');
var generateToken = require('../auth/generateToken');

module.exports = (app) => {
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
}
