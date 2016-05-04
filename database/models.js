'use strict';
import Sequelize from 'sequelize';

// import connection to db
import connection from './connection';

// import meta configs for models
import EndeavorPeakSAMeta from './models/EndeavorPeakSA';
import EndeavorPeakFBMeta from './models/EndeavorPeakFB';
import EndeavorPeakMeta from './models/EndeavorPeak';
import EndeavorMeta from './models/Endeavor';
import RangePeakSAMeta from './models/RangePeakSA';
import RangePeakFBMeta from './models/RangePeakFB';
import RangePeakMeta from './models/RangePeak';
import RangeMeta from './models/Range';
import UserMeta from './models/User';
import TeamMeta from './models/Team';
import OrganizationMeta from './models/Organization';

// define all the models in the db
var EndeavorPeakSA = connection.define('endeavor_peak_sas', EndeavorPeakSAMeta.attributes, EndeavorPeakSAMeta.options);
var EndeavorPeakFB = connection.define('endeavor_peak_fbs', EndeavorPeakFBMeta.attributes, EndeavorPeakFBMeta.options);
var EndeavorPeak = connection.define('endeavor_peaks', EndeavorPeakMeta.attributes, EndeavorPeakMeta.options);
var Endeavor = connection.define('endeavors', EndeavorMeta.attributes, EndeavorMeta.options);
var RangePeakSA = connection.define('range_peak_sas', RangePeakSAMeta.attributes, RangePeakSAMeta.options);
var RangePeakFB = connection.define('range_peak_fbs', RangePeakFBMeta.attributes, RangePeakFBMeta.options);
var RangePeak = connection.define('range_peaks', RangePeakMeta.attributes, RangePeakMeta.options);
var Range = connection.define('ranges', RangeMeta.attributes, RangeMeta.options);
var User = connection.define('users', UserMeta.attributes, UserMeta.options);
var Team = connection.define('teams', TeamMeta.attributes, TeamMeta.options);
var Organization = connection.define('srganizations', OrganizationMeta.attributes, OrganizationMeta.options);

// define relationships between models
Organization.hasMany(Team);

Team.hasMany(User, {as: 'Members'});
Team.hasMany(Endeavor);

User.hasMany(Range);
User.hasOne(User, {as: 'Mentor'});

Range.hasMany(RangePeak);

RangePeak.hasOne(RangePeakSA);
RangePeak.hasOne(RangePeakFB);
RangePeak.hasOne(User, {as: 'Creator'});

RangePeakFB.hasOne(User, {as: 'Giver'});

Endeavor.hasMany(EndeavorPeak);

EndeavorPeak.hasOne(User);
EndeavorPeak.hasOne(User, {as: 'Creator'});
EndeavorPeak.hasOne(RangePeakSA);
EndeavorPeak.hasOne(RangePeakFB);

EndeavorPeakFB.hasOne(User, {as: 'Giver'});



// export all models
export default {
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
