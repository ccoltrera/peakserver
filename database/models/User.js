'use strict';
var Sequelize = require('sequelize');

var attributes = {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  firstName: {
    type: Sequelize.STRING,
  },
  lastName: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  salt: {
    type: Sequelize.STRING
  },
  avatar: {
    type: Sequelize.JSON
  },
  title: {
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

