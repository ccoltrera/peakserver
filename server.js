'use strict';

var Express = require('express');
var bodyParser = require('body-parser');

var app = Express();

var authAPI = require('./api/auth'),
  userAPI = require('./api/users'),
  rangeAPI = require('./api/ranges'),
  rangePeakAPI = require('./api/range-peaks');


app.use(bodyParser.json());

authAPI(app);
userAPI(app);
rangeAPI(app);
rangePeakAPI(app);

module.exports = app;
