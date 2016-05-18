'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.post('/api/orgs/:org/teams', jwtAuth, (req, res) => {
    // var leader = req.user.id;
    // var newOrganizationInstance;

    // models.Organization.create(req.body)
    //   .then((org) => {

    //     newOrganizationInstance = org;

    //     if (leader) {
    //       return org.setLeader(leader);
    //     }
    //     else {
    //       return;
    //     }
    //   })
    //   .catch((err) => {
    //     if (err.errors[0].message === 'name must be unique') {
    //       res.sendStatus(409);
    //     }
    //   })
    //   .then(() => {
    //     res.status(200).json(newOrganizationInstance);
    //   });
  });

  app.get('/api/orgs/:org/teams', jwtAuth, (req, res) => {
    // models.Organization.findAll({where: req.query})
    //   .then((orgs) => {
    //     res.status(200).json(orgs);
    //   });
  });

  app.get('/api/orgs/:org/teams/:team', jwtAuth, (req, res) => {
    // var searchId = req.params.org;

    // models.Organization.findById(searchId)
    //   .then((org) => {
    //     if (org) {
    //       res.status(200).json(org);
    //     }
    //     else {
    //       res.sendStatus(404);
    //     }
    //   });
  });

  app.post('/api/orgs/:org/teams/:team', jwtAuth, (req, res) => {
    // var leader = req.body.leader;
    // var orgInstance;

    // req.body.leader = null;

    // models.Organization
    //   .findOne({
    //     where: {id: req.params.org},
    //     include: [{
    //       model: models.User,
    //       as: 'Leader'
    //     }]
    //   })
    //   .then((org) => {
    //     if (org) {
    //       if (org['Leader'].dataValues.id == req.user.id) {
    //         org.update(req.body)
    //           .then((org) => {
    //             orgInstance = org;

    //             if (leader) {
    //               return org.setLeader(leader);
    //             }
    //             else {
    //               return;
    //             }
    //           })
    //           .then(() => {
    //             res.status(200).json(orgInstance);
    //           });
    //       } else {
    //         res.sendStatus(401);
    //       }
    //     } else {
    //       res.sendStatus(404);
    //     }

    //   });
  });

  app.delete('/api/orgs/:org/teams/:team', jwtAuth, (req, res) => {
    // models.Organization
    //   .findOne({
    //     where: {id: req.params.org},
    //     include: [{
    //       model: models.User,
    //       as: 'Leader'
    //     }]
    //   })
    //   .then((org) => {
    //     if (org) {
    //       if (org['Leader'].dataValues.id == req.user.id) {
    //         org.destroy()
    //           .then(() => {
    //             res.sendStatus(200);
    //           });
    //       } else {
    //         res.sendStatus(401);
    //       }
    //     } else {
    //       res.sendStatus(404);
    //     }

    //   });
  });

}
