'use strict';
var passport = require('passport');
var { Strategy } = require('passport-local');
var bcrypt = require('bcrypt');
var models = require('../database/models');

passport.use(new Strategy(
  (email, password, done) => {
    console.log(email, password);

    models.User.findOne({
      where: {
        'email': email
      }
    }).then(function (user) {
      if (user === null) {
        return done(null, false, {message: 'Incorrect credentials.'});
      }

      var hashedPassword = bcrypt.hashSync(password, user.salt);

      if (user.password === hashedPassword) {
        user.password = null;
        user.salt = null;
        return done(null, user);
      }

      return done(null, false, {message: 'Incorrect credentials.'})
    });
  }
));

module.exports = passport;
