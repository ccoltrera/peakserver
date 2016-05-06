'use strict';
var expressJwt = require('express-jwt');

var jwtSecret = (process.env.DB_URL || 'server secret');

module.exports = expressJwt({secret : jwtSecret});
