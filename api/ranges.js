'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  // app.get('/range', jwtAuth, (req, res) => {
  //   models.User.findOne({where: {id: req.user.id}})
  //     .then((user) => {
  //       if (user == null) {
  //         res.sendStatus(401);
  //       }
  //       else {
  //         res.status(200).json(user);
  //       }
  //     });
  // });

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


}
