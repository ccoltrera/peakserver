'use strict';

var Express = require('express');
var bodyParser = require('body-parser');

var app = Express();

var authAPI = require('./api/auth'),
  userAPI = require('./api/users'),
  rangeAPI = require('./api/ranges'),
  rangePeakAPI = require('./api/range-peaks'),
  rangePeakFBAPI = require('./api/range-peak-fb'),
  rangePeakSAAPI = require('./api/range-peak-sa'),
  orgAPI = require('./api/orgs'),
  teamAPI = require('./api/teams'),
  orgUserAPI = require('./api/org-users'),
  teamUserAPI = require('./api/team-users');


app.use(bodyParser.json());

authAPI(app);
userAPI(app);
rangeAPI(app);
rangePeakAPI(app);
rangePeakFBAPI(app);
rangePeakSAAPI(app);
orgAPI(app);
teamAPI(app);
orgUserAPI(app);
teamUserAPI(app);

module.exports = app;
