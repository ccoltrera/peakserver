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
  orgUserAPI = require('./api/org-users'),
  teamAPI = require('./api/teams'),
  teamUserAPI = require('./api/team-users'),
  endeavorsAPI = require('./api/endeavors'),
  EndeavorPeaksAPI = require('./api/endeavor-peaks'),
  EndeavorPeaksFBAPI = require('./api/endeavor-peak-fb');


app.use(bodyParser.json());

authAPI(app);
userAPI(app);
rangeAPI(app);
rangePeakAPI(app);
rangePeakFBAPI(app);
rangePeakSAAPI(app);
orgAPI(app);
orgUserAPI(app);
teamAPI(app);
teamUserAPI(app);
endeavorsAPI(app);
EndeavorPeaksAPI(app);
EndeavorPeaksFBAPI(app);

module.exports = app;
