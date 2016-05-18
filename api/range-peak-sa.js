'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.get('/api/users/:user/ranges/:range/peaks/:peak/sa', jwtAuth, (req, res) => {
    // models.User
    //   .findOne({
    //     where: { id: req.params.user },
    //     include: [{
    //       model: models.Range,
    //       where: { id: req.params.range },
    //       include: [{
    //         model: models.RangePeak,
    //         where: { id: req.params.peak }
    //       }]
    //     }]
    //   })
    //   .then((user) => {
    //     if (user) {
    //       let range = user['dataValues']['Ranges'][0];
    //       let peak = range['RangePeaks'][0];
    //       res.status(200).json(peak);
    //     } else {
    //       res.sendStatus(404);
    //     }
    //   });

  });

  app.post('/api/users/:user/ranges/:range/peaks/:peak/sa', jwtAuth, (req, res) => {
    // See if user's JWT matches what they are trying to edit
    // if (req.params.user == req.user.id) {
    //   models.User
    //   .findOne({
    //     where: { id: req.params.user },
    //     include: [{
    //       model: models.Range,
    //       where: { id: req.params.range },
    //       include: [{
    //         model: models.RangePeak,
    //         where: { id: req.params.peak }
    //       }]
    //     }]
    //   })
    //   .then((user) => {
    //     if (user) {
    //       let range = user['dataValues']['Ranges'][0];
    //       let peak = range['RangePeaks'][0];
    //       peak.update(req.body)
    //           .then((peak) => {
    //             res.status(200).send(peak);
    //           });
    //     } else {
    //       res.sendStatus(404);
    //     }
    //   });

    // } else {
    //   // If not, 401 status
    //   res.sendStatus(401);
    // }

  });

  app.delete('/api/users/:user/ranges/:range/peaks/:peak/sa', jwtAuth, (req, res) => {
    // See if user's JWT matches what they are trying to edit
    // if (req.params.user == req.user.id) {
    //   models.User
    //   .findOne({
    //     where: { id: req.params.user },
    //     include: [{
    //       model: models.Range,
    //       where: { id: req.params.range },
    //       include: [{
    //         model: models.RangePeak,
    //         where: { id: req.params.peak }
    //       }]
    //     }]
    //   })
    //   .then((user) => {
    //     if (user) {
    //       let range = user['dataValues']['Ranges'][0];
    //       let peak = range['RangePeaks'][0];
    //       peak.destroy()
    //           .then(() => {
    //             res.sendStatus(200);
    //           });
    //     } else {
    //       res.sendStatus(404);
    //     }
    //   });

    // } else {
    //   // If not, 401 status
    //   res.sendStatus(401);
    // }

  });

}
