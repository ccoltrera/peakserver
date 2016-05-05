'use strict';
var Sequelize = require('sequelize');

var attributes = {
  body: {
    type: Sequelize.STRING
  },
  date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
};

var options = {
  freezeTableName: true
};

module.exports = {
  attributes: attributes,
  options: options
};

