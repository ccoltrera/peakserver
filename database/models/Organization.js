'use strict';
var Sequelize = require('sequelize');

var attributes = {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  salt: {
    type: Sequelize.STRING,
    allowNull: false
  }
};

var options = {
  freezeTableName: true
};

module.exports = {
  attributes: attributes,
  options: options
};

