'use strict';
import Sequelize from 'sequelize';

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

export default {
  attributes: attributes,
  options: options
};
