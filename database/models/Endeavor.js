'use strict';
var Sequelize = require('sequelize');

var attributes = {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING
  }
};

var options = {
  freezeTableName: true
};

module.exports = {
  attributes: attributes,
  options: options
};
