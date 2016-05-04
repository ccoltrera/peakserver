'use strict';
import Sequelize from 'sequelize';
var connection = new Sequelize(process.env.DB_URL || 'postgres://postgres:postgres@localhost:5432/peak');

export default connection;
