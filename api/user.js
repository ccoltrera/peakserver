'use strict';
import bcrypt from 'bcrypt';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');
var salt = process.env.SALT || '$2a$10$somethingheretobeasalt';

module.exports = (app) => {

  app.post('/users', (req, res) => {
    var newUser = req.body;

    newUser.salt = salt;
    newUser.password = bcrypt.hashSync(newUser.password, newUser.salt);

    console.log(newUser);

    models.User.create(newUser)
      .then((user) => {
        // remove sensitive info
        user.password = null;
        user.salt = null;

        res.status(200).json(user);
      })
      .catch((err) => {
        if (err.errors[0].message === 'email must be unique') {
          res.sendStatus(409);
        }
      });
  });

  app.get('/users/:user', jwtAuth, (req, res) => {
    var userId = req.user.id;
    var searchId = req.params.user;

    models.User.findById(searchId)
      .then((user) => {
        if (user) {
          // remove sensitive info
          user.password = null;
          user.salt = null;

          res.status(200).json(user);
        }
        else {
          res.sendStatus(404);
        }
      });
  });

  app.post('/users/:user', jwtAuth, (req, res) => {
    models.User.findById(req.user.id)
      .then((user) => {
        if (user) {
          user.update(req.body)
            .then((user) => {
              user.password = null;
              user.salt = null;

              res.status(200).json(user);
            });
        }

        else {
          res.sendStatus(404);
        }

      });
  });

}
