'use strict';
import bcrypt from 'bcrypt';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');
var salt = process.env.ORGSALT || '$2a$10$somethingheretobeasalt';

module.exports = (app) => {

  app.post('/api/orgs', jwtAuth, (req, res) => {
    var leader = req.user.id;
    var newOrganizationInstance;

    req.body.salt = salt;
    req.body.password = bcrypt.hashSync(req.body.password, req.body.salt);

    models.Organization.create(req.body)
      .then((org) => {
        // remove sensitive data
        org.password = null;
        org.salt = null;

        newOrganizationInstance = org;

        return org.setLeader(leader);

      })
      .catch((err) => {
        if (err.errors[0].message === 'name must be unique') {
          res.sendStatus(409);
        }
      })
      .then((org) => {
        if (org) {
          return org.addUser(leader);
        }
      })
      .then((org) => {
        res.status(200).json(newOrganizationInstance);
      });
  });

  app.get('/api/orgs', jwtAuth, (req, res) => {
    models.Organization.findAll({
      where: req.query,
      attributes: { exclude: ['salt', 'password']}
    })
      .then((orgs) => {
        res.status(200).json(orgs);
      });
  });

  app.get('/api/orgs/:org', jwtAuth, (req, res) => {
    var searchId = req.params.org;

    models.Organization.findById(searchId)
      .then((org) => {
        if (org) {
          // remove sensitive data
          org.password = null;
          org.salt = null;
          res.status(200).json(org);
        }
        else {
          res.sendStatus(404);
        }
      });
  });

  app.post('/api/orgs/:org', jwtAuth, (req, res) => {
    var leader = req.body.leader;
    var orgInstance;

    req.body.leader = null;

    models.Organization
      .findOne({
        where: {id: req.params.org},
        include: [{
          model: models.User,
          as: 'Leader'
        }]
      })
      .then((org) => {
        if (org) {
          if (org['Leader'].dataValues.id == req.user.id) {
            org.update(req.body)
              .then((org) => {
                // remove sensitive data
                org.password = null;
                org.salt = null;

                orgInstance = org;

                if (leader) {
                  return org.setLeader(leader);
                }
                else {
                  return;
                }
              })
              .then(() => {
                res.status(200).json(orgInstance);
              });
          } else {
            res.sendStatus(401);
          }
        } else {
          res.sendStatus(404);
        }

      });
  });

  app.delete('/api/orgs/:org', jwtAuth, (req, res) => {
    models.Organization
      .findOne({
        where: {id: req.params.org},
        include: [{
          model: models.User,
          as: 'Leader'
        }]
      })
      .then((org) => {
        if (org) {
          if (org['Leader'].dataValues.id == req.user.id) {
            org.destroy()
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
