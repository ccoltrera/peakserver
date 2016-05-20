'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.get('/api/orgs/:org/teams/:team/users', jwtAuth, (req, res) => {
    models.Organization.findOne({
      where: {
        id: req.params.org
      },
      include: [{
        model: models.Team,
        where: {id: req.params.team},
        include: [{
          model: models.User,
          where: req.query
        }]
      }]
    })
    .then((org) => {
      if (org) {
        org.getUsers({where: {id: req.user.id}})
          .then((users) => {
            if (users.length) {
              res.status(200).json(org.Teams[0].Users);
            } else {
              res.sendStatus(401);
            }
          })
      } else {
        res.sendStatus(404);
      }
    });
  });

  app.post('/api/orgs/:org/teams/:team/users', jwtAuth, (req, res) => {

    models.Organization.findOne({
      where: {id: req.params.org},
      include: [{
        model: models.Team,
        where: {id: req.params.team},
        include: [{
          model: models.User,
          as: 'Leader'
        }]
      }]
    })
    .then((org) => {
      if (org) {
        let team = org['Teams'][0];
        let teamLeaderId = team['Leader']['id'];
        // check if self or team leader
        if  (req.user.id == req.body.id || req.user.id == teamLeaderId) {
          team.addUser(req.body.id)
            .then((user) => {
              res.status(200).json(team);
            });
        } else {
          res.sendStatus(401);
        }
      } else {
        res.sendStatus(404);
      }

    });

  });

  app.delete('/api/orgs/:org/teams/:team/users/:user', jwtAuth, (req, res) => {
    models.Organization.findOne({
      where: {id: req.params.org},
      include: [{
        model: models.Team,
        where: {id: req.params.team},
        include: [{
          model: models.User,
          as: 'Leader'
        }]
      }]
    })
      .then((org) => {
        if (org) {
          let team = org['Teams'][0];
          let teamLeaderId = team['Leader']['id'];
          // check if self or team leader
          if  (req.user.id == req.params.user || req.user.id == teamLeaderId) {
            team.removeUser(req.params.user)
              .then(() => {
                res.sendStatus(200);
              });
          } else {
            res.sendStatus(401);
          }
        } else {
          res.sendStatus(404);
        }

      });
  });

}
