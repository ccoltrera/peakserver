'use strict';

var Express = require('express');
var bodyParser = require('body-parser');

var app = Express();

var authAPI = require('./api/auth'),
  orgAPI = require('./api/orgs'),
  teamAPI = require('./api/teams'),
  userAPI = require('./api/users'),
  endeavorAPI = require('./api/endeavors'),
  rangeAPI = require('./api/ranges'),
  peakAPI = require('./api/peaks'),
  feedbackAPI = require('./api/fb');


app.use(bodyParser.json());

authAPI(app);
orgAPI(app);
teamAPI(app);
userAPI(app);
endeavorAPI(app);
rangeAPI(app);
peakAPI(app);
feedbackAPI(app);

module.exports = app;
