'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.post('/api/users/:user/ranges', jwtAuth, (req, res) => {
    // See if user's JWT matches what they are trying to edit
    if (req.params.user == req.user.id) {
      var userInstance, newRangeInstance;

      models.User.findById(req.params.user)
        .then((user) => {
          userInstance = user;
          return user.getRanges();
        })
        .then((ranges) => {
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
            return userInstance.addRange(range);
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
    models.User.findById(req.params.user)
      .then((user) => {
        if (user) {
          user.getRanges()
            .then((ranges) => {
              res.status(200).json(ranges);
            });
        }
        else {
          res.sendStatus(404);
        }
      });
  });

  app.get('/api/users/:user/ranges/:range', jwtAuth, (req, res) => {
    models.User.findById(req.params.user)
      .then((user) => {
        if (user) {
          user.getRanges({where: {id: req.params.range} })
            .then((ranges) => {
              let range = ranges[0];
              if (range) {
                res.status(200).json(range);
              }
              else {
                res.sendStatus(404);
              }
            });
        }
        else {
          res.sendStatus(404);
        }
      });
  });

  app.post('/api/users/:user/ranges/:range', jwtAuth, (req, res) => {
    if (req.params.user == req.user.id) {
      models.User
        .findAll({
          where: { id: req.params.user },
          include: [{
            model: models.Range,
            where: { id: req.params.range }
          }]
        })
        .then((users) => {
          if (users.length) {
            let range = users[0]['dataValues']['Ranges'][0];
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

}
