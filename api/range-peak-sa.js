'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.get('/api/users/:user/ranges/:range/peaks/:peak/sa', jwtAuth, (req, res) => {
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
              model: models.RangePeakSA
            }]
          }]
        }]
      })
      .then((user) => {
        if (user) {
          let range = user['dataValues']['Ranges'][0];
          let peak = range['RangePeaks'][0];
          let sa = peak['RangePeakSA'];
          res.status(200).json(sa);
        } else {
          res.sendStatus(404);
        }
      });

  });

  app.post('/api/users/:user/ranges/:range/peaks/:peak/sa', jwtAuth, (req, res) => {
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
            where: { id: req.params.peak },
            include: [{
              model: models.RangePeakSA
            }]
          }]
        }]
      })
      .then((user) => {
        // check if given user / range / peak combo exists
        if (user) {
          let range = user['dataValues']['Ranges'][0];
          let peak = range['RangePeaks'][0];
          let oldSA = peak['RangePeakSA'];
          // check if sa already exists
          if (oldSA) {
            oldSA.update(req.body)
              .then((sa) => {
                res.status(200).send(sa);
              })
          } else {
            models.RangePeakSA.create(req.body)
              .then((sa) => {
                // associate feedback to the peak
                peak.setRangePeakSA(sa)
                  .then(() => {
                    res.status(200).send(sa);
                  });
              });
          }

        } else {
          res.sendStatus(404);
        }
      });

    } else {
      // If not, 401 status
      res.sendStatus(401);
    }

  });

  app.delete('/api/users/:user/ranges/:range/peaks/:peak/sa', jwtAuth, (req, res) => {
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
            where: { id: req.params.peak },
            include: [{
              model: models.RangePeakSA
            }]
          }]
        }]
      })
      .then((user) => {
        // check if given user / range / peak combo exists
        if (user) {
          let range = user['dataValues']['Ranges'][0];
          let peak = range['RangePeaks'][0];
          let oldSA = peak['RangePeakSA'];
          // check if sa already exists
          if (oldSA) {
            oldSA.destroy()
              .then(() => {
                res.sendStatus(200);
              })
          } else {
            res.sendStatus(404);
          }

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
