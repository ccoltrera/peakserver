'use strict';
var Sequelize = require('sequelize');

var attributes = {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING
  },
  priority: {
    type: Sequelize.INTEGER
  },
  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  created: {
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
