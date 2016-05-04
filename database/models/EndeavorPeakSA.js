'use strict';
import Sequelize from 'sequelize';

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

export default {
  attributes: attributes,
  options: options
};
