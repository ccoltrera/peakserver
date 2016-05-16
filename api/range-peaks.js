'use strict';

var models = require('../database/models');
var jwtAuth = require('../auth/jwtAuth');

module.exports = (app) => {

  app.post('/api/users/:user/ranges/:range/peaks', jwtAuth, (req, res) => {

  });

  app.get('/api/users/:user/ranges/:range/peaks', jwtAuth, (req, res) => {

  });

  app.get('/api/users/:user/ranges/:range/peaks/:peak', jwtAuth, (req, res) => {

  });

  app.post('/api/users/:user/ranges/:range/peaks/:peak', jwtAuth, (req, res) => {

  });

  app.delete('/api/users/:user/ranges/:range/peaks/:peak', jwtAuth, (req, res) => {

  });

}
