'use strict';
var Sequelize = require('sequelize');
var connection = new Sequelize(process.env.DB_URL || 'postgres://postgres:postgres@localhost:5432/peak');

module.exports = connection;
