'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.get('/api/users/:user/ranges/:range/peaks/:peak/fb', jwtAuth, (req, res) => {
    models.User
      .findOne({
        where: { id: req.params.user },
        include: [{
          model: models.Range,
          where: { id: req.params.range },
          include: [{
            model: models.RangePeak,
            where: { id: req.params.peak },
            include: [{
              model: models.RangePeakFB
            }]
          }]
        }]
      })
      .then((user) => {
        if (user) {
          let range = user['dataValues']['Ranges'][0];
          let peak = range['RangePeaks'][0];
          let fb = peak['RangePeakFB'];
          res.status(200).json(fb);
        } else {
          res.sendStatus(404);
        }
      });

  });

  app.post('/api/users/:user/ranges/:range/peaks/:peak/fb', jwtAuth, (req, res) => {
    // See if user's JWT matches mentor of what they are trying to edit
    models.User
      .findOne({
        where: { id: req.params.user },
        include: [{
          model: models.Range,
          where: { id: req.params.range },
          include: [{
            model: models.RangePeak,
            where: { id: req.params.peak },
            include: [{
              model: models.RangePeakFB
            }]
          }]
        }, {
          model: models.User,
          as: 'Mentor'
        }]
      })
      .then((user) => {
        // check if given user / range / peak combo exists
        if (user) {
          // check if JWT matches mentor
          if (user['Mentor'].dataValues.id == req.user.id) {
            let range = user['dataValues']['Ranges'][0];
            let peak = range['RangePeaks'][0];
            let oldFB = peak['RangePeakFB'];
            // check if fb already exists
            if (oldFB) {
              oldFB.update(req.body)
                .then((fb) => {
                  res.status(200).send(fb);
                })
            } else {
              models.RangePeakFB.create(req.body)
                .then((fb) => {
                  // associate feedback to the peak
                  peak.setRangePeakFB(fb)
                    .then(() => {
                      res.status(200).send(fb);
                    });
                });
            }
          } else {
            // If not, 401 status
            res.sendStatus(401);
          }

        } else {
          res.sendStatus(404);
        }
      });



  });

  app.delete('/api/users/:user/ranges/:range/peaks/:peak/fb', jwtAuth, (req, res) => {
        // See if user's JWT matches mentor of what they are trying to edit
    models.User
      .findOne({
        where: { id: req.params.user },
        include: [{
          model: models.Range,
          where: { id: req.params.range },
          include: [{
            model: models.RangePeak,
            where: { id: req.params.peak },
            include: [{
              model: models.RangePeakFB
            }]
          }]
        }, {
          model: models.User,
          as: 'Mentor'
        }]
      })
      .then((user) => {
        // check if given user / range / peak combo exists
        if (user) {
          // check if JWT matches mentor
          if (user['Mentor'].dataValues.id == req.user.id) {
            let range = user['dataValues']['Ranges'][0];
            let peak = range['RangePeaks'][0];
            let oldFB = peak['RangePeakFB'];
            // check if fb exists
            if (oldFB) {
              oldFB.destroy()
                .then(() => {
                  res.sendStatus(200);
                })
            } else {
              res.sendStatus(404);
            }
          } else {
            // If not, 401 status
            res.sendStatus(401);
          }

        } else {
          res.sendStatus(404);
        }
      });

  });

}
