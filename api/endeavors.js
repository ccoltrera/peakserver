'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  // app.get('/endeavor', jwtAuth, (req, res) => {
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

}
