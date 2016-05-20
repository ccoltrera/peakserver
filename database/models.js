'use strict';
var Sequelize = require('sequelize');

// require connection to db
var connection = require('./connection');

// require meta configs for models
var EndeavorPeakSAMeta = require('./models/EndeavorPeakSA');
var EndeavorPeakFBMeta = require('./models/EndeavorPeakFB');
var EndeavorPeakMeta = require('./models/EndeavorPeak');
var EndeavorMeta = require('./models/Endeavor');
var RangePeakSAMeta = require('./models/RangePeakSA');
var RangePeakFBMeta = require('./models/RangePeakFB');
var RangePeakMeta = require('./models/RangePeak');
var RangeMeta = require('./models/Range');
var UserMeta = require('./models/User');
var TeamMeta = require('./models/Team');
var OrganizationMeta = require('./models/Organization');

// define all the models in the db
var EndeavorPeakSA = connection.define('EndeavorPeakSA', EndeavorPeakSAMeta.attributes, EndeavorPeakSAMeta.options);
var EndeavorPeakFB = connection.define('EndeavorPeakFB', EndeavorPeakFBMeta.attributes, EndeavorPeakFBMeta.options);
var EndeavorPeak = connection.define('EndeavorPeak', EndeavorPeakMeta.attributes, EndeavorPeakMeta.options);
var Endeavor = connection.define('Endeavor', EndeavorMeta.attributes, EndeavorMeta.options);
var RangePeakSA = connection.define('RangePeakSA', RangePeakSAMeta.attributes, RangePeakSAMeta.options);
var RangePeakFB = connection.define('RangePeakFB', RangePeakFBMeta.attributes, RangePeakFBMeta.options);
var RangePeak = connection.define('RangePeak', RangePeakMeta.attributes, RangePeakMeta.options);
var Range = connection.define('Range', RangeMeta.attributes, RangeMeta.options);
var User = connection.define('User', UserMeta.attributes, UserMeta.options);
var Team = connection.define('Team', TeamMeta.attributes, TeamMeta.options);
var Organization = connection.define('Organization', OrganizationMeta.attributes, OrganizationMeta.options);

// define relationships between models
Organization.belongsToMany(Team, {through: 'OrganizationTeam'});
Team.belongsTo(Organization, {through: 'OrganizationTeam'});
Organization.belongsToMany(User, {through: 'OrganizationUser'});
// User.belongsTo(Organization, {through: 'OrganizationUser'});
Organization.belongsTo(User, {as: 'Leader'});

Team.belongsToMany(User, {through: 'TeamUser'});
Team.belongsTo(User, {as: 'Leader'});
Team.belongsToMany(Endeavor, {through: 'TeamEndeavor'});

User.hasMany(Range);
User.belongsTo(User, {as: 'Mentor'});

Range.hasMany(RangePeak);

RangePeak.hasOne(RangePeakSA);
RangePeak.hasOne(RangePeakFB);

RangePeak.belongsTo(User, {as: 'Creator'});

// RangePeakFB.belongsTo(User, {as: 'Giver'}); // just use the mentor

Endeavor.hasMany(EndeavorPeak);

EndeavorPeak.belongsTo(User);
EndeavorPeak.belongsTo(User, {as: 'Creator'});
EndeavorPeak.hasOne(RangePeakSA);
EndeavorPeak.hasOne(RangePeakFB);

EndeavorPeakFB.belongsTo(User, {as: 'Giver'}); //

// connection.sync({force: true});

// export all models
module.exports = {
  EndeavorPeakSA: EndeavorPeakSA,
  EndeavorPeakFB: EndeavorPeakFB,
  EndeavorPeak: EndeavorPeak,
  Endeavor: Endeavor,
  RangePeakSA: RangePeakSA,
  RangePeakFB: RangePeakFB,
  RangePeak: RangePeak,
  Range: Range,
  User: User,
  Team: Team,
  Organization: Organization
}
