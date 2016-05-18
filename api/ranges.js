'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.post('/api/users/:user/ranges', jwtAuth, (req, res) => {
    // See if user's JWT matches what they are trying to edit
    if (req.params.user == req.user.id) {
      var userInstance, newRangeInstance;

      models.User
        .findOne({
          where: { id: req.params.user },
          include: [{
            model: models.Range
          }]
        })
        .then((user) => {
          let ranges = user['dataValues']['Ranges'];
          // Check through user's ranges, return 409 if already exists
          for (let i = 0; i < ranges.length; i++) {
            if (ranges[i].dataValues.name === req.body.name) {
              return res.sendStatus(409);
            }
          }

          // Else create the range
          models.Range.create(req.body)
          .then((range) => {
            newRangeInstance = range;
            // Associate the range with the user
            return user.addRange(range);
          })
          .then(() => {
            res.status(200).json(newRangeInstance);
          });

        });

    } else {
      // If not, 409 status
      res.sendStatus(401);
    }
  });

  app.get('/api/users/:user/ranges', jwtAuth, (req, res) => {
    models.User
      .findOne({
          where: { id: req.params.user },
          include: [{
            model: models.Range
          }]
        })
      .then((user) => {
        if (user) {
          let ranges = user['dataValues']['Ranges'];
          res.status(200).json(ranges);
        }
        else {
          res.sendStatus(404);
        }
      });
  });

  app.get('/api/users/:user/ranges/:range', jwtAuth, (req, res) => {
    models.User
      .findOne({
          where: { id: req.params.user },
          include: [{
            model: models.Range,
            where: { id: req.params.range }
          }]
        })
      .then((user) => {
        if (user) {
          let range = user['dataValues']['Ranges'][0];
          res.status(200).json(range);
        }
        else {
          res.sendStatus(404);
        }
      });
  });

  app.post('/api/users/:user/ranges/:range', jwtAuth, (req, res) => {
    if (req.params.user == req.user.id) {
      models.User
        .findOne({
          where: { id: req.params.user },
          include: [{
            model: models.Range,
            where: { id: req.params.range }
          }]
        })
        .then((user) => {
          if (user) {
            let range = user['dataValues']['Ranges'][0];
            range.update(req.body)
              .then((range) => {
                res.status(200).send(range);
              });

          }
          else {
            res.sendStatus(404);
          }
        });
    }
    else {
      res.sendStatus(401);
    }
  });

  app.delete('/api/users/:user/ranges/:range', jwtAuth, (req, res) => {
    if (req.params.user == req.user.id) {
      models.User
        .findOne({
          where: { id: req.params.user },
          include: [{
            model: models.Range,
            where: { id: req.params.range }
          }]
        })
        .then((user) => {
          if (user) {
            let range = user['dataValues']['Ranges'][0];
            range.destroy()
              .then((range) => {
                res.sendStatus(200);
              });

          }
          else {
            res.sendStatus(404);
          }
        });
    }
    else {
      res.sendStatus(401);
    }
  });

}
