'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.get('/api/orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak/sa', jwtAuth, (req, res) => {

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
              model: models.EndeavorPeakSA
            }, {
              model: models.User
            }]
          }]
        }]
      }]
    })
    .then((org) => {
      if (org) {
        let peak = org.Teams[0].Endeavors[0].EndeavorPeaks[0];
        let user = peak.User;
        if (req.user.id == peak.User.id) {
          res.status(200).json(peak.EndeavorPeakSA);
        } else {
          res.sendStatus(401);
        }
      } else {
        res.sendStatus(404);
      }
    });
  });

  app.post('/api/orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak/sa', jwtAuth, (req, res) => {
    var saInstance;

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
              model: models.EndeavorPeakSA
            }, {
              model: models.User
            }]
          }]
        }]
      }]
    })
    .then((org) => {
      if (org) {
        let peak = org.Teams[0].Endeavors[0].EndeavorPeaks[0];
        let user = peak.User;
        if (req.user.id == peak.User.id) {
          if (peak.EndeavorPeakSA) {
            peak.EndeavorPeakSA.update(req.body)
              .then((sa) => {
                res.status(200).json(sa);
              });
          } else {
            models.EndeavorPeakSA.create(req.body)
              .then((sa) => {
                peak.setEndeavorPeakSA(sa)
                  .then((sa) => {
                    res.status(200).json(sa);
                  });
              });
          }
        } else {
          res.sendStatus(401);
        }
      } else {
        res.sendStatus(404);
      }
    });
  });

  app.delete('/api/orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak/sa', jwtAuth, (req, res) => {
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
              model: models.EndeavorPeakSA
            }, {
              model: models.User
            }]
          }]
        }]
      }]
    })
    .then((org) => {
      if (org) {
        let peak = org.Teams[0].Endeavors[0].EndeavorPeaks[0];
        let user = peak.User;
        if (req.user.id == peak.User.id) {
          if (peak.EndeavorPeakSA) {
            peak.EndeavorPeakSA.destroy()
              .then((sa) => {
                res.sendStatus(200);
              });
          } else {
            res.sendStatus(200);
          }
        } else {
          res.sendStatus(401);
        }
      } else {
        res.sendStatus(404);
      }
    });
  });

}
