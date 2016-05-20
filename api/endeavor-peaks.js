'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.get('/api/orgs/:org/teams/:team/endeavors/:endeavor/peaks', jwtAuth, (req, res) => {
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
            where: req.query
          }]
        }]
      }]
    })
    .then((org) => {
      if (org) {
        org.getUsers({where: {id: req.user.id}})
          .then((users) => {
            if (users.length) {
              res.status(200).json(org.Teams[0].Endeavors[0].EndeavorPeaks);
            } else {
              res.sendStatus(401);
            }
          })
      } else {
        res.sendStatus(404);
      }
    });
  });

  app.post('/api/orgs/:org/teams/:team/endeavors/:endeavor/peaks', jwtAuth, (req, res) => {
    var peakUser = req.body.user;
    var peakInstance;

    models.Organization.findOne({
      where: {
        id: req.params.org
      },
      include: [{
        model: models.Team,
        where: {id: req.params.team},
        include: [{
          model: models.Endeavor,
          where: {id: req.params.endeavor}
        }]
      }]
    })
    .then((org) => {
      if (org) {
        let team = org.Teams[0];
        let endeavor = team.Endeavors[0];
        team.getUsers({where: {id: req.user.id}})
          .then((users) => {
            if (users.length) {
              endeavor.getEndeavorPeaks({where: {name: req.body.name}})
                .then((peaks) => {
                  if (peaks.length) {
                    res.sendStatus(409);
                  } else {
                    models.EndeavorPeak.create(req.body)
                      .then((peak) => {
                        peakInstance = peak;
                        return endeavor.addEndeavorPeak(peak);
                      })
                      .then(() => {
                        if (peakUser) {
                          return peakInstance.setUser(peakUser);
                        } else {
                          return
                        }
                      })
                      .then(() => {
                        res.status(200).json(peakInstance);
                      });
                  }
                });
            } else {
              res.sendStatus(401);
            }
          })
      } else {
        res.sendStatus(404);
      }
    });

  });

  app.get('/api/orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak', jwtAuth, (req, res) => {

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
            where: {id: req.params.peak}
          }]
        }]
      }]
    })
    .then((org) => {
      if (org) {
        org.getUsers({where: {id: req.user.id}})
          .then((users) => {
            if (users.length) {
              res.status(200).json(org.Teams[0].Endeavors[0].EndeavorPeaks[0]);
            } else {
              res.sendStatus(401);
            }
          })
      } else {
        res.sendStatus(404);
      }
    });
  });

  app.post('/api/orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak', jwtAuth, (req, res) => {
    var peakUser = req.body.user;
    var peakInstance;

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
            where: {id: req.params.peak}
          }]
        }]
      }]
    })
    .then((org) => {
      if (org) {
        let team = org.Teams[0];
        let peak = team.Endeavors[0].EndeavorPeaks[0];
        team.getUsers({where: {id: req.user.id}})
          .then((users) => {
            if (users.length) {
              peak.update(req.body)
                .then((peak) => {
                  peakInstance = peak;

                  if (peakUser) {
                    return peakInstance.setUser(peakUser);
                  } else {
                    return
                  }
                })
                .then((peak) => {
                  res.status(200).json(peak);
                })
            } else {
              res.sendStatus(401);
            }
          })
      } else {
        res.sendStatus(404);
      }
    });
  });

  app.delete('/api/orgs/:org/teams/:team/endeavors/:endeavor/peaks/:peak', jwtAuth, (req, res) => {
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
            where: {id: req.params.peak}
          }]
        }]
      }]
    })
    .then((org) => {
      if (org) {
        let team = org.Teams[0];
        let peak = team.Endeavors[0].EndeavorPeaks[0];
        team.getUsers({where: {id: req.user.id}})
          .then((users) => {
            if (users.length) {
              peak.destroy()
                .then(() => {
                  res.sendStatus(200);
                })
            } else {
              res.sendStatus(401);
            }
          })
      } else {
        res.sendStatus(404);
      }
    });
  });

}
