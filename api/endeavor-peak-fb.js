'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.get('/api/orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak/fb', jwtAuth, (req, res) => {

    models.Organization.findOne({
      where: {
        id: req.params.org
      },
      include: [{
        model: models.Team,
        where: {id: req.params.team},
        include: [{
          model: models.Endeavor,
          where: {id: req.params.endeavor},
          include: [{
            model: models.EndeavorPeak,
            where: {id: req.params.peak},
            include: [{
              model: models.EndeavorPeakFB
            }]
          }]
        }]
      }]
    })
    .then((org) => {
      if (org) {
        let team = org.Teams[0];
        team.getUsers({where: {id: req.user.id}})
          .then((users) => {
            if (users.length) {
              res.status(200).json(org.Teams[0].Endeavors[0].EndeavorPeaks[0].EndeavorPeakFB);
            } else {
              res.sendStatus(401);
            }
          })
      } else {
        res.sendStatus(404);
      }
    });
  });

  app.post('/api/orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak/fb', jwtAuth, (req, res) => {
    var fbInstance;

    models.Organization.findOne({
      where: {
        id: req.params.org
      },
      include: [{
        model: models.Team,
        where: {id: req.params.team},
        include: [{
          model: models.Endeavor,
          where: {id: req.params.endeavor},
          include: [{
            model: models.EndeavorPeak,
            where: {id: req.params.peak},
            include: [{
              model: models.EndeavorPeakFB,
              include: [{
                model: models.User,
                as: 'Giver'
              }]
            }]
          }]
        }]
      }]
    })
    .then((org) => {
      if (org) {
        let team = org.Teams[0];
        let peak = team.Endeavors[0].EndeavorPeaks[0];
        let oldFB = peak.EndeavorPeakFB;

        if (oldFB) {
          if (req.user.id == oldFB.Giver.id) {
            oldFB.update(req.body)
                .then((fb) => {
                  res.status(200).json(fb);
                })
          } else {
            res.sendStatus(409);
          }
        } else {
        team.getUsers({where: {id: req.user.id}})
          .then((users) => {
            if (users.length) {
              models.EndeavorPeakFB.create(req.body)
                .then((fb) => {
                  fbInstance = fb;
                  return fbInstance.setGiver(req.user.id);
                })
                .then((fb) => {
                  peak.setEndeavorPeakFB(fb);
                })
                .then(() => {
                  res.status(200).json(fbInstance);
                })
            } else {
              res.sendStatus(401);
            }
          });
        }
      } else {
        res.sendStatus(404);
      }
    });
  });

  app.delete('/api/orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak/fb', jwtAuth, (req, res) => {
    models.Organization.findOne({
      where: {
        id: req.params.org
      },
      include: [{
        model: models.Team,
        where: {id: req.params.team},
        include: [{
          model: models.Endeavor,
          where: {id: req.params.endeavor},
          include: [{
            model: models.EndeavorPeak,
            where: {id: req.params.peak},
            include: [{
              model: models.EndeavorPeakFB,
              include: [{
                model: models.User,
                as: 'Giver'
              }]
            }]
          }]
        }]
      }]
    })
    .then((org) => {
      if (org) {
        let team = org.Teams[0];
        let peak = team.Endeavors[0].EndeavorPeaks[0];
        let oldFB = peak.EndeavorPeakFB;

        if (oldFB) {
          if (req.user.id == oldFB.Giver.id) {
            oldFB.destroy(req.body)
                .then(() => {
                  res.sendStatus(200);
                })
          } else {
            res.sendStatus(401);
          }
        } else {
          res.sendStatus(404);
        }
      } else {
        res.sendStatus(404);
      }
    });
  });

}
