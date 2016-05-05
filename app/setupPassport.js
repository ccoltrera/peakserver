'use strict';
import passport from 'passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';
import Model from '../database/models';

passport.use(new Strategy(
  (email, password, done) => {
    console.log(email, password);

    Model.User.findOne({
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

export default passport;
