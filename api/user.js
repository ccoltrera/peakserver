'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.get('/user', jwtAuth, (req, res) => {
    var searchID = req.query.id || req.user.id;

    models.User.findOne({where: {id: searchID}})
      .then((user) => {
        if (user == null) {
          res.sendStatus(401);
        }
        else {
          // remove sensitive info
          user.password = null;
          user.salt = null;

          res.status(200).json(user);
        }
      });
  });

  app.post('/user', jwtAuth, (req, res) => {
    models.User.update(req.body, {where: {id: req.user.id}})
      .then((user) => {
        if (user == null) {
          res.sendStatus(401);
        }
        else {
          res.status(200).json(user);
        }
      });
  });

}
