'use strict';
var bcrypt = require('bcrypt');

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.get('/api/orgs/:org/users', jwtAuth, (req, res) => {
    models.Organization.findOne({
      where: {
        id: req.params.org
      },
      include: [{
        model: models.User,
        where: req.query
      }]
    })
    .then((org) => {
      if (org) {
        org.getUsers({where: {id: req.user.id}})
          .then((users) => {
            if (users.length) {
              res.status(200).json(org.Users);
            } else {
              res.sendStatus(401);
            }
          })
      } else {
        res.sendStatus(404);
      }
    });
  });

  app.post('/api/orgs/:org/users', jwtAuth, (req, res) => {

    models.Organization.findOne({
      where: {id: req.params.org}
    })
    .then((org) => {
      if (org) {
        // compare password to hashed one stored in db
        bcrypt.compare(req.body.password, org.password, function(err, bcryptRes) {
            if (bcryptRes) {
              // check if user already a member of org
              org.getUsers({where: {id: req.user.id}})
                .then((users) => {
                  if (users.length) {
                    res.sendStatus(409);
                  } else {
                    org.addUser(req.user.id)
                      .then((user) => {
                        res.status(200).json(org);
                      })
                  }
                })
            } else {
              res.sendStatus(401);
            }
        });

      } else {
        res.sendStatus(401);
      }
    });

  });

  app.delete('/api/orgs/:org/users/:user', jwtAuth, (req, res) => {
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
          let orgLeaderId = org['Leader'].dataValues.id;
          console.log(orgLeaderId + 'VS' + req.user.id)
          // check if user either org leader of param user
          if (req.user.id == req.params.user || orgLeaderId == req.user.id) {
            org.removeUser(req.params.user)
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
