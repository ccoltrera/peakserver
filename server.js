'use strict';

var Express = require('express');
var bodyParser = require('body-parser');

var app = Express();

var authAPI = require('./api/auth'),
  orgAPI = require('./api/org'),
  teamAPI = require('./api/team'),
  userAPI = require('./api/user'),
  endeavorAPI = require('./api/endeavor'),
  rangeAPI = require('./api/range'),
  peakAPI = require('./api/peak'),
  feedbackAPI = require('./api/feedback');


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
