'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.get('/api/orgs/:org/teams/:team/endeavors', jwtAuth, (req, res) => {
    models.Organization.findOne({
      where: {
        id: req.params.org
      },
      include: [{
        model: models.Team,
        where: {id: req.params.team},
        include: [{
          model: models.Endeavor,
          where: req.query
        }]
      }]
    })
    .then((org) => {
      if (org) {
        org.getUsers({where: {id: req.user.id}})
          .then((users) => {
            if (users.length) {
              res.status(200).json(org.Teams[0].Endeavors);
            } else {
              res.sendStatus(401);
            }
          })
      } else {
        res.sendStatus(404);
      }
    });
  });

  app.post('/api/orgs/:org/teams/:team/endeavors', jwtAuth, (req, res) => {
    var endeavorInstance;

    models.Organization.findOne({
      where: {
        id: req.params.org
      },
      include: [{
        model: models.Team,
        where: {id: req.params.team},
      }]
    })
    .then((org) => {
      if (org) {
        let team = org.Teams[0];
        team.getUsers({where: {id: req.user.id}})
          .then((users) => {
            if (users.length) {
              team.getEndeavors({where: {name: req.body.name}})
                .then((endeavors) => {
                  if (endeavors.length) {
                    res.sendStatus(409);
                  } else {
                    models.Endeavor.create(req.body)
                      .then((endeavor) => {
                        endeavorInstance = endeavor;
                        return team.addEndeavor(endeavor);
                      })
                      .then(() => {
                        res.status(200).json(endeavorInstance);
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

  app.get('/api/orgs/:org/teams/:team/endeavors/:endeavor', jwtAuth, (req, res) => {

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
        org.getUsers({where: {id: req.user.id}})
          .then((users) => {
            if (users.length) {
              res.status(200).json(org.Teams[0].Endeavors[0]);
            } else {
              res.sendStatus(401);
            }
          })
      } else {
        res.sendStatus(404);
      }
    });
  });

  app.post('/api/orgs/:org/teams/:team/endeavors/:endeavor', jwtAuth, (req, res) => {
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
              endeavor.update(req.body)
                .then((endeavor) => {
                  res.status(200).json(endeavor);
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

  app.delete('/api/orgs/:org/teams/:team/endeavors/:endeavor', jwtAuth, (req, res) => {
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
              endeavor.destroy()
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
