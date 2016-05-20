'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.post('/api/users/:user/ranges/:range/peaks', jwtAuth, (req, res) => {
    // See if user's JWT matches what they are trying to edit

      models.User
        .findOne({
          where: { id: req.params.user },
          include: [{
            model: models.Range,
            where: { id: req.params.range },
            include: [{
              model: models.RangePeak
            }]
          },{
            model: models.User,
            as: 'Mentor'
          }]
        })
        .then((user) => {
          var mentorId;
          if (user.Mentor) {
            mentorId = user.Mentor.id;
          }

          if (req.user.id == req.params.user || req.user.id == mentorId) {
            var newPeakInstance;

            let range = user['dataValues']['Ranges'][0];
            let peaks = range['RangePeaks'];
            // Check through range's peaks, return 409 if already exists
            for (let i = 0; i < peaks.length; i++) {
              if (peaks[i].dataValues.name === req.body.name) {
                return res.sendStatus(409);
              }
            }

            // Else create the peak
            models.RangePeak.create(req.body)
              .then((peak) => {
                newPeakInstance = peak;
                // Associate the peak with the user
                return range.addRangePeak(peak);
              })
              .then(() => {
                return newPeakInstance.setCreator(req.user.id);
              })
              .then(() => {
                res.status(200).json(newPeakInstance);
              });

          } else {
            // If not, 401 status
            res.sendStatus(401);
          }
        });


  });

  app.get('/api/users/:user/ranges/:range/peaks', jwtAuth, (req, res) => {
    models.User
      .findOne({
        where: { id: req.params.user },
        include: [{
          model: models.Range,
          where: { id: req.params.range },
          include: [{
            model: models.RangePeak
          }]
        }]
      })
      .then((user) => {
        if (user) {
          let range = user['dataValues']['Ranges'][0];
          let peaks = range['RangePeaks'];
          res.status(200).json(peaks);
        } else {
          res.sendStatus(404);
        }
      });

  });

  app.get('/api/users/:user/ranges/:range/peaks/:peak', jwtAuth, (req, res) => {
    models.User
      .findOne({
        where: { id: req.params.user },
        include: [{
          model: models.Range,
          where: { id: req.params.range },
          include: [{
            model: models.RangePeak,
            where: { id: req.params.peak }
          }]
        }]
      })
      .then((user) => {
        if (user) {
          let range = user['dataValues']['Ranges'][0];
          let peak = range['RangePeaks'][0];
          res.status(200).json(peak);
        } else {
          res.sendStatus(404);
        }
      });

  });

  app.post('/api/users/:user/ranges/:range/peaks/:peak', jwtAuth, (req, res) => {
    // See if user's JWT matches what they are trying to edit
    if (req.params.user == req.user.id) {
      models.User
      .findOne({
        where: { id: req.params.user },
        include: [{
          model: models.Range,
          where: { id: req.params.range },
          include: [{
            model: models.RangePeak,
            where: { id: req.params.peak }
          }]
        }]
      })
      .then((user) => {
        if (user) {
          let range = user['dataValues']['Ranges'][0];
          let peak = range['RangePeaks'][0];
          peak.update(req.body)
              .then((peak) => {
                res.status(200).send(peak);
              });
        } else {
          res.sendStatus(404);
        }
      });

    } else {
      // If not, 401 status
      res.sendStatus(401);
    }

  });

  app.delete('/api/users/:user/ranges/:range/peaks/:peak', jwtAuth, (req, res) => {
    // See if user's JWT matches what they are trying to edit
    if (req.params.user == req.user.id) {
      models.User
      .findOne({
        where: { id: req.params.user },
        include: [{
          model: models.Range,
          where: { id: req.params.range },
          include: [{
            model: models.RangePeak,
            where: { id: req.params.peak }
          }]
        }]
      })
      .then((user) => {
        if (user) {
          let range = user['dataValues']['Ranges'][0];
          let peak = range['RangePeaks'][0];
          peak.destroy()
              .then(() => {
                res.sendStatus(200);
              });
        } else {
          res.sendStatus(404);
        }
      });

    } else {
      // If not, 401 status
      res.sendStatus(401);
    }

  });

}
