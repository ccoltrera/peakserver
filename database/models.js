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
Organization.hasMany(Team);
Organization.hasMany(User);
Organization.hasOne(User, {as: 'Leader'});

Team.hasMany(User);
// for admin purposes
Team.hasOne(User, {as: 'Leader'});
Team.hasMany(Endeavor);

User.hasMany(Range);
User.hasOne(User, {as: 'Mentor'});

Range.hasMany(RangePeak);

RangePeak.hasOne(RangePeakSA);
RangePeak.hasOne(RangePeakFB);
// RangePeak.hasOne(User, {as: 'Creator'}); // just track as self / mentor in string?

// RangePeakFB.hasOne(User, {as: 'Giver'}); // just use the mentor

Endeavor.hasMany(EndeavorPeak);

EndeavorPeak.hasOne(User);
EndeavorPeak.hasOne(User, {as: 'Creator'});
EndeavorPeak.hasOne(RangePeakSA);
EndeavorPeak.hasOne(RangePeakFB);

// EndeavorPeakFB.hasOne(User, {as: 'Giver'}); //

connection.sync();

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
