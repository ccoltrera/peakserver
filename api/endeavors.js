'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.get('/api/orgs/:org/teams/:team/endeavors', jwtAuth, (req, res) => {
    // models.Organization.findOne({
    //   where: {
    //     id: req.params.org
    //   },
    //   include: [{
    //     model: models.Team,
    //     where: req.query
    //   }]
    // })
    // .then((org) => {
    //   if (org) {
    //     org.getUsers({where: {id: req.user.id}})
    //       .then((users) => {
    //         if (users.length) {
    //           res.status(200).json(org.Teams);
    //         } else {
    //           res.sendStatus(401);
    //         }
    //       })
    //   } else {
    //     res.sendStatus(404);
    //   }
    // });
  });

  app.post('/api/orgs/:org/teams/:team/endeavors', jwtAuth, (req, res) => {
    // var leader = req.user.id;
    // var newTeamInstance;

    // models.Organization.findOne({
    //   where: {id: req.params.org},
    //   include: [{
    //     model: models.User,
    //     where: {id: req.user.id}
    //   }]
    // })
    // .then((org) => {
    //   if (org) {
    //     // check for existing team
    //     org.getTeams({
    //       where: {name: req.body.name}
    //     })
    //     .then((teams) => {
    //       if (teams[0]) {
    //         res.sendStatus(409);
    //       } else {
    //         models.Team.create(req.body)
    //           .then((team) => {
    //             newTeamInstance = team;
    //             return team.setLeader(leader);
    //           })
    //           .then((team) => {
    //             return team.addUser(leader);
    //           })
    //           .then((users) => {
    //             return org.addTeam(newTeamInstance);
    //           })
    //           .then((org) => {
    //             res.status(200).json(newTeamInstance);
    //           });
    //       }
    //     })

    //   } else {
    //     res.sendStatus(401);
    //   }
    // });

  });

  app.get('/api/orgs/:org/teams/:team/endeavors/:endeavor', jwtAuth, (req, res) => {
    // var searchId = req.params.team;

    // models.Organization.findOne({
    //   where: {
    //     id: req.params.org
    //   },
    //   include: [{
    //     model: models.Team,
    //     where: {id: searchId}
    //   }]
    // })
    // .then((org) => {
    //   if (org) {
    //     org.getUsers({where: {id: req.user.id}})
    //       .then((users) => {
    //         if (users.length) {
    //           res.status(200).json(org.Teams[0]);
    //         } else {
    //           res.sendStatus(401);
    //         }
    //       })
    //   } else {
    //     res.sendStatus(404);
    //   }
    // });
  });

  app.post('/api/orgs/:org/teams/:team/endeavors/:endeavor', jwtAuth, (req, res) => {
    // var leader = req.body.leader;
    // var teamInstance;

    // req.body.leader = null;

    // models.Organization
    //   .findOne({
    //     where: {id: req.params.org},
    //     include: [{
    //       model: models.User,
    //       as: 'Leader'
    //     },{
    //       model: models.Team,
    //       where: {id: req.params.team},
    //       include: [{
    //         model: models.User,
    //         as: 'Leader'
    //       }]
    //     }]
    //   })
    //   .then((org) => {
    //     if (org) {
    //       let teamLeaderId = org['Teams'][0]['Leader'].dataValues.id;
    //       let orgLeaderId = org['Leader'].dataValues.id;
    //       let team = org['Teams'][0]
    //       if (teamLeaderId == req.user.id || orgLeaderId == req.user.id) {
    //         team.update(req.body)
    //           .then((team) => {
    //             teamInstance = team;

    //             if (leader) {
    //               return team.setLeader(leader);
    //             }
    //             else {
    //               return;
    //             }
    //           })
    //           .then(() => {
    //             res.status(200).json(teamInstance);
    //           });
    //       } else {
    //         res.sendStatus(401);
    //       }
    //     } else {
    //       res.sendStatus(404);
    //     }

    //   });
  });

  app.delete('/api/orgs/:org/teams/:team/endeavors/:endeavor', jwtAuth, (req, res) => {
    // models.Organization
    //   .findOne({
    //     where: {id: req.params.org},
    //     include: [{
    //       model: models.User,
    //       as: 'Leader'
    //     },{
    //       model: models.Team,
    //       where: {id: req.params.team},
    //       include: [{
    //         model: models.User,
    //         as: 'Leader'
    //       }]
    //     }]
    //   })
    //   .then((org) => {
    //     if (org) {
    //       let teamLeaderId = org['Teams'][0]['Leader'].dataValues.id;
    //       let orgLeaderId = org['Leader'].dataValues.id;
    //       let team = org['Teams'][0]
    //       if (teamLeaderId == req.user.id || orgLeaderId == req.user.id) {
    //         team.destroy()
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
