'use strict';
import Sequelize from 'sequelize';

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

export default {
  attributes: attributes,
  options: options
};
