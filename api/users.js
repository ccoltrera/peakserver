'use strict';
import bcrypt from 'bcrypt';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');
var salt = process.env.SALT || '$2a$10$somethingheretobeasalt';

module.exports = (app) => {

  app.post('/api/users', (req, res) => {
    var mentor = req.body.mentor;
    var newUserInstance;

    req.body.mentor = null;
    req.body.salt = salt;
    req.body.password = bcrypt.hashSync(req.body.password, req.body.salt);

    models.User.create(req.body)
      .then((user) => {
        // remove sensitive info
        user.password = null;
        user.salt = null;

        newUserInstance = user;

        if (mentor) {
          return user.setMentor(mentor);
        }
        else {
          return;
        }
      })
      .catch((err) => {
        if (err.errors[0].message === 'email must be unique') {
          res.sendStatus(409);
        }
      })
      .then(() => {
        res.status(200).json(newUserInstance);
      });
  });

  app.get('/api/users', jwtAuth, (req, res) => {
    models.User.findAll({where: req.query})
      .then((users) => {
        res.status(200).json(users);
      });
  });

  app.get('/api/users/:user', jwtAuth, (req, res) => {
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

  app.post('/api/users/:user', jwtAuth, (req, res) => {
    var mentor = req.body.mentor;
    var userInstance;

    req.body.mentor = null;

    models.User.findById(req.user.id)
      .then((user) => {
        if (user) {
          return user.update(req.body)
        }

        else {
          res.sendStatus(404);
        }

      })
      .then((user) => {
        user.password = null;
        user.salt = null;

        userInstance = user;

        if (mentor) {
          return user.setMentor(mentor);
        }
        else {
          return;
        }
      })
      .then(() => {
        res.status(200).json(userInstance);
      });
  });

  app.delete('/api/users/:user', jwtAuth, (req, res) => {

    if (req.user.id == req.params.user) {
      models.User.destroy({where: {id: req.user.id}})
        .then(() => {
          res.sendStatus(200);
        });
    }

    else {
      res.sendStatus(401);
    }
  });

}
