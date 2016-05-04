'use strict';
import Sequelize from 'sequelize';

var attributes = {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
};

var options = {
  freezeTableName: true
};

export default {
  attributes: attributes,
  options: options
};
