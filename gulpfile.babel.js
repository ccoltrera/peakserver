'use strict';

import gulp from 'gulp';
import mocha from 'gulp-mocha';

gulp.task('default', ['test']);

// test task
gulp.task('test', () => {
  // grab ever js file in tests/
  return gulp.src('./tests/api-tests.js')
  // pipe them to gulp wrapper on mocha test framework, with progress reporter
  .pipe( mocha({ 'reporter' : 'progress' }) );
});

// watch task
gulp.task('watch', () => {
  // set up watch on js files in root and db folders, to run test on change
  return gulp.watch(['./*.js','./database/*.js'], ['test'])
});
