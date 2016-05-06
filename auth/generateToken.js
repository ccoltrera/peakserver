'use strict';

var jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  req.token = jwt.sign({
    id: req.user.id
  }, 'server secret', {
    expiresIn: '120m'
  });

  next();

}
